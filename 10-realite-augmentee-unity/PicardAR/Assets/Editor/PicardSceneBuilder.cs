using TMPro;
using Unity.XR.CoreUtils;
using UnityEditor;
using UnityEditor.Build;
using UnityEditor.Events;
using UnityEditor.SceneManagement;
using UnityEditor.XR.ARSubsystems;
using UnityEngine;
using UnityEngine.EventSystems;
using UnityEngine.InputSystem;
using UnityEngine.InputSystem.UI;
using UnityEngine.InputSystem.XR;
using UnityEngine.UI;
using UnityEngine.XR.ARFoundation;
using UnityEngine.XR.ARSubsystems;

/// <summary>Builds the whole AR scene, the panel prefab and the image library from code, so nothing is hand edited in YAML.</summary>
public static class PicardSceneBuilder
{
    const string MarkerPath = "Assets/AR/marker-picard-campus.jpg";
    const string LibraryPath = "Assets/AR/PicardMarkers.asset";
    const string PrefabPath = "Assets/Prefabs/ProductPanel.prefab";
    const string ScenePath = "Assets/Scenes/PicardAR.unity";

    // 15 cm printed marker, must match the paper size or ARKit puts the panels at the wrong depth
    static readonly Vector2 MarkerSizeMeters = new Vector2(0.15f, 0.1875f);

    [MenuItem("Picard/Build AR Scene")]
    public static void BuildScene()
    {
        if (Resources.Load<TMP_Settings>("TMP Settings") == null)
        {
            Debug.LogError("TextMeshPro resources are missing. Window > TextMeshPro > Import TMP Essential Resources, then run the menu again.");
            return;
        }

        // ask before we touch the open scene, the prefab build dirties it
        if (!EditorSceneManager.SaveCurrentModifiedScenesIfUserWantsTo())
            return;

        var library = BuildImageLibrary();
        if (library == null)
            return;

        var prefab = BuildPanelPrefab();
        var scene = EditorSceneManager.NewScene(NewSceneSetup.EmptyScene, NewSceneMode.Single);

        // AR Session
        var sessionGo = new GameObject("AR Session");
        sessionGo.AddComponent<ARSession>();
        sessionGo.AddComponent<ARInputManager>();

        // XR Origin > Camera Offset > Main Camera
        var originGo = new GameObject("XR Origin");
        var origin = originGo.AddComponent<XROrigin>();

        var offsetGo = new GameObject("Camera Offset");
        offsetGo.transform.SetParent(originGo.transform, false);

        var camGo = new GameObject("Main Camera");
        camGo.tag = "MainCamera";
        camGo.transform.SetParent(offsetGo.transform, false);
        var cam = camGo.AddComponent<Camera>();
        cam.clearFlags = CameraClearFlags.SolidColor;
        cam.backgroundColor = Color.black;
        cam.nearClipPlane = 0.1f;
        cam.farClipPlane = 20f;
        camGo.AddComponent<AudioListener>();
        camGo.AddComponent<ARCameraManager>();
        camGo.AddComponent<ARCameraBackground>();
        AddPoseDriver(camGo);

        origin.Camera = cam;
        origin.CameraFloorOffsetObject = offsetGo;
        origin.RequestedTrackingOriginMode = XROrigin.TrackingOriginMode.Device;
        origin.CameraYOffset = 0f;

        var imageManager = originGo.AddComponent<ARTrackedImageManager>();
        SetLibrary(imageManager, library);
        imageManager.requestedMaxNumberOfMovingImages = 1;

        // spawner + tap
        var logicGo = new GameObject("Panel Spawner");
        var spawner = logicGo.AddComponent<TrackedImagePanelSpawner>();
        SetRef(spawner, "imageManager", imageManager);
        SetRef(spawner, "panelPrefab", prefab);
        logicGo.AddComponent<TapHandler>();

        var hintGo = BuildHud();
        SetRef(spawner, "hint", hintGo);

        var esGo = new GameObject("EventSystem");
        esGo.AddComponent<EventSystem>();
        var module = esGo.AddComponent<InputSystemUIInputModule>();
        // without this the taps never reach the buttons
        module.AssignDefaultActions();

        EnsureFolder("Assets/Scenes");
        EditorSceneManager.SaveScene(scene, ScenePath);
        EditorBuildSettings.scenes = new[] { new EditorBuildSettingsScene(ScenePath, true) };
        AssetDatabase.SaveAssets();

        Debug.Log("Picard AR scene built at " + ScenePath);
    }

    [MenuItem("Picard/Apply iOS Player Settings")]
    public static void ApplyIosSettings()
    {
        PlayerSettings.productName = "Picard AR";
        PlayerSettings.companyName = "IIM";
        PlayerSettings.SetApplicationIdentifier(NamedBuildTarget.iOS, "fr.iim.picardar");
        PlayerSettings.iOS.cameraUsageDescription = "La caméra sert à reconnaître l'affiche du distributeur Picard.";
        // auto rotation relies on statusBarOrientation, a no-op on iOS 27: the view stays
        // portrait while ARKit thinks landscape, so the pose is off by 90 deg. Fixed orientation avoids it.
        PlayerSettings.defaultInterfaceOrientation = UIOrientation.Portrait;
        // Unity 6.6 supports iOS 15+, ARKit image tracking with validation needs 13+
        PlayerSettings.iOS.targetOSVersionString = "15.0";
        // ARM64 + Metal are already the defaults on iOS, ARKit needs both
        AssetDatabase.SaveAssets();
        Debug.Log("iOS player settings applied. ARKit still has to be ticked in XR Plug-in Management > iOS.");
    }

    static XRReferenceImageLibrary BuildImageLibrary()
    {
        var tex = AssetDatabase.LoadAssetAtPath<Texture2D>(MarkerPath);
        if (tex == null)
        {
            Debug.LogError("Marker not found at " + MarkerPath);
            return null;
        }

        // ARKit wants the source texture readable and uncompressed
        var importer = AssetImporter.GetAtPath(MarkerPath) as TextureImporter;
        if (importer != null && (!importer.isReadable || importer.textureCompression != TextureImporterCompression.Uncompressed))
        {
            importer.isReadable = true;
            importer.textureCompression = TextureImporterCompression.Uncompressed;
            importer.SaveAndReimport();
            tex = AssetDatabase.LoadAssetAtPath<Texture2D>(MarkerPath);
        }

        var lib = AssetDatabase.LoadAssetAtPath<XRReferenceImageLibrary>(LibraryPath);
        if (lib == null)
        {
            lib = ScriptableObject.CreateInstance<XRReferenceImageLibrary>();
            AssetDatabase.CreateAsset(lib, LibraryPath);
        }

        if (lib.count == 0)
        {
            lib.Add();
            lib.SetName(0, "picard-campus");
            lib.SetTexture(0, tex, true); // keep texture so XR Simulation can match it
            lib.SetSpecifySize(0, true);
            lib.SetSize(0, MarkerSizeMeters);
            EditorUtility.SetDirty(lib);
            AssetDatabase.SaveAssets();
        }

        return lib;
    }

    static GameObject BuildPanelPrefab()
    {
        EnsureFolder("Assets/Prefabs");

        var root = new GameObject("ProductPanel");
        var col = root.AddComponent<BoxCollider>();
        col.size = new Vector3(0.16f, 0.15f, 0.01f);
        root.AddComponent<Billboard>();
        var panel = root.AddComponent<ProductPanel>();

        // 320 x 300 px at 0.0005 = 16 x 15 cm in the world
        var canvasGo = new GameObject("Canvas", typeof(RectTransform));
        canvasGo.transform.SetParent(root.transform, false);
        var canvas = canvasGo.AddComponent<Canvas>();
        canvas.renderMode = RenderMode.WorldSpace;
        canvasGo.AddComponent<GraphicRaycaster>();
        var canvasRt = canvasGo.GetComponent<RectTransform>();
        canvasRt.sizeDelta = new Vector2(320f, 300f);
        canvasRt.localScale = Vector3.one * 0.0005f;

        // content grows with the text size (WCAG 1.4.4), the card is not a fixed box
        var content = MakeRect("Content", canvasGo.transform);
        var contentRt = content.GetComponent<RectTransform>();
        contentRt.anchorMin = new Vector2(0f, 1f);
        contentRt.anchorMax = new Vector2(1f, 1f);
        contentRt.pivot = new Vector2(0.5f, 1f);
        contentRt.anchoredPosition = Vector2.zero;
        contentRt.sizeDelta = new Vector2(0f, 200f);
        var bg = content.AddComponent<Image>();
        bg.color = new Color(1f, 1f, 1f, 0.9f);
        bg.raycastTarget = false;
        var border = content.AddComponent<Outline>();
        border.effectColor = Color.white;
        border.effectDistance = Vector2.zero;
        border.enabled = false; // turned on only in high contrast mode
        var layout = content.AddComponent<VerticalLayoutGroup>();
        layout.padding = new RectOffset(12, 12, 12, 12);
        layout.spacing = 6f;
        layout.childControlWidth = true;
        layout.childControlHeight = true;
        layout.childForceExpandWidth = true;
        layout.childForceExpandHeight = false;
        var fitter = content.AddComponent<ContentSizeFitter>();
        fitter.verticalFit = ContentSizeFitter.FitMode.PreferredSize;

        var title = MakeText("Title", content.transform, "Produit", 30f, FontStyles.Bold);
        var body = MakeText("Body", content.transform, "0.00 EUR", 20f, FontStyles.Normal);
        var detail = MakeText("Detail", content.transform, "Allergènes : ", 20f, FontStyles.Normal);
        var infoButton = MakeButton("InfoButton", content.transform, "Plus d'infos");
        var backButton = MakeButton("BackButton", content.transform, "Retour");
        backButton.gameObject.SetActive(false);

        SetRef(panel, "canvas", canvas);
        SetRef(panel, "background", bg);
        SetRef(panel, "border", border);
        SetRef(panel, "title", title);
        SetRef(panel, "body", body);
        SetRef(panel, "detail", detail);
        SetRef(panel, "infoButton", infoButton);
        SetRef(panel, "backButton", backButton);

        var prefab = PrefabUtility.SaveAsPrefabAsset(root, PrefabPath);
        Object.DestroyImmediate(root);
        return prefab;
    }

    static GameObject BuildHud()
    {
        var hudGo = new GameObject("HUD", typeof(RectTransform));
        var canvas = hudGo.AddComponent<Canvas>();
        canvas.renderMode = RenderMode.ScreenSpaceOverlay;
        var scaler = hudGo.AddComponent<CanvasScaler>();
        scaler.uiScaleMode = CanvasScaler.ScaleMode.ScaleWithScreenSize;
        scaler.referenceResolution = new Vector2(390f, 844f); // iPhone points
        scaler.matchWidthOrHeight = 0.5f;
        hudGo.AddComponent<GraphicRaycaster>();
        var settings = hudGo.AddComponent<AccessibilitySettings>();

        // hint at the top, dark strip so it stays readable over the camera feed
        var hint = MakeRect("Hint", hudGo.transform);
        var hintRt = hint.GetComponent<RectTransform>();
        hintRt.anchorMin = new Vector2(0f, 1f);
        hintRt.anchorMax = new Vector2(1f, 1f);
        hintRt.pivot = new Vector2(0.5f, 1f);
        hintRt.anchoredPosition = new Vector2(0f, -60f);
        hintRt.sizeDelta = new Vector2(-32f, 56f);
        var hintBg = hint.AddComponent<Image>();
        hintBg.color = new Color(0f, 0f, 0f, 0.75f);
        hintBg.raycastTarget = false;
        var hintText = MakeText("Text", hint.transform, "Vise l'affiche sur le distributeur", 16f, FontStyles.Normal);
        hintText.color = Color.white;
        hintText.alignment = TextAlignmentOptions.Center;
        Stretch(hintText.GetComponent<RectTransform>(), 8f);

        // two buttons at the bottom, 56 pt tall (Apple HIG and WCAG 2.5.5 ask for 44 minimum)
        var contrast = MakeHudButton(hudGo.transform, "Dark mode", -70f);
        var text = MakeHudButton(hudGo.transform, "Texte 100 %", 70f);

        UnityEventTools.AddPersistentListener(contrast.onClick, settings.ToggleContrast);
        UnityEventTools.AddPersistentListener(text.onClick, settings.CycleTextScale);

        SetRef(settings, "contrastLabel", contrast.GetComponentInChildren<TMP_Text>());
        SetRef(settings, "textLabel", text.GetComponentInChildren<TMP_Text>());

        return hint;
    }

    static Button MakeHudButton(Transform parent, string label, float x)
    {
        var btn = MakeButton(label, parent, label);
        var rt = btn.GetComponent<RectTransform>();
        rt.anchorMin = new Vector2(0.5f, 0f);
        rt.anchorMax = new Vector2(0.5f, 0f);
        rt.pivot = new Vector2(0.5f, 0f);
        rt.anchoredPosition = new Vector2(x, 32f);
        rt.sizeDelta = new Vector2(118f, 56f);
        return btn;
    }

    static void AddPoseDriver(GameObject camGo)
    {
        // same bindings as the XR Origin (Mobile AR) menu item
        var pos = new InputAction("Position", InputActionType.Value, expectedControlType: "Vector3");
        pos.AddBinding("<XRHMD>/centerEyePosition");
        pos.AddBinding("<HandheldARInputDevice>/devicePosition");
        var rot = new InputAction("Rotation", InputActionType.Value, expectedControlType: "Quaternion");
        rot.AddBinding("<XRHMD>/centerEyeRotation");
        rot.AddBinding("<HandheldARInputDevice>/deviceRotation");

        var driver = camGo.AddComponent<TrackedPoseDriver>();
        driver.positionInput = new InputActionProperty(pos);
        driver.rotationInput = new InputActionProperty(rot);
    }

    static void SetLibrary(ARTrackedImageManager manager, XRReferenceImageLibrary lib)
    {
        // public property first, it is the reliable path (SerializedObject alone left the
        // manager without a library in a real build once, ARKit started with no detectionImages)
        manager.referenceLibrary = lib;

        var so = new SerializedObject(manager);
        var prop = so.FindProperty("m_SerializedLibrary");
        if (prop != null)
        {
            prop.objectReferenceValue = lib;
            so.ApplyModifiedPropertiesWithoutUndo();
        }
    }

    static TextMeshProUGUI MakeText(string name, Transform parent, string text, float size, FontStyles style)
    {
        var go = MakeRect(name, parent);
        var t = go.AddComponent<TextMeshProUGUI>();
        t.text = text;
        t.fontSize = size;
        t.fontStyle = style;
        t.color = new Color(0.10f, 0.20f, 0.40f);
        t.raycastTarget = false;
        return t;
    }

    static Button MakeButton(string name, Transform parent, string label)
    {
        var go = MakeRect(name, parent);
        var img = go.AddComponent<Image>();
        img.color = new Color(0.10f, 0.20f, 0.40f);
        var btn = go.AddComponent<Button>();
        btn.targetGraphic = img;
        var le = go.AddComponent<LayoutElement>();
        le.minHeight = 48f;

        var t = MakeText("Label", go.transform, label, 18f, FontStyles.Bold);
        t.color = Color.white;
        t.alignment = TextAlignmentOptions.Center;
        t.enableAutoSizing = true;
        t.fontSizeMin = 12f;
        t.fontSizeMax = 18f;
        Stretch(t.GetComponent<RectTransform>(), 4f);
        return btn;
    }

    static GameObject MakeRect(string name, Transform parent)
    {
        var go = new GameObject(name, typeof(RectTransform));
        go.transform.SetParent(parent, false);
        return go;
    }

    static void Stretch(RectTransform rt, float margin)
    {
        rt.anchorMin = Vector2.zero;
        rt.anchorMax = Vector2.one;
        rt.offsetMin = new Vector2(margin, margin);
        rt.offsetMax = new Vector2(-margin, -margin);
    }

    static void SetRef(Object target, string field, Object value)
    {
        var so = new SerializedObject(target);
        var prop = so.FindProperty(field);
        if (prop == null)
        {
            Debug.LogWarning("no field " + field + " on " + target.name);
            return;
        }
        prop.objectReferenceValue = value;
        so.ApplyModifiedPropertiesWithoutUndo();
    }

    static void EnsureFolder(string path)
    {
        if (AssetDatabase.IsValidFolder(path))
            return;
        var parent = System.IO.Path.GetDirectoryName(path).Replace("\\", "/");
        var name = System.IO.Path.GetFileName(path);
        AssetDatabase.CreateFolder(parent, name);
    }
}
