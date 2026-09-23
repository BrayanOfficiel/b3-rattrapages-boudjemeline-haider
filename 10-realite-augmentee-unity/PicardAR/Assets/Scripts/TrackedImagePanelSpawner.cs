using System.Collections.Generic;
using UnityEngine;
using UnityEngine.XR.ARFoundation;
using UnityEngine.XR.ARSubsystems;

/// <summary>Spawns the product panels in an arc above the Picard marker once it is tracked.</summary>
public class TrackedImagePanelSpawner : MonoBehaviour
{
    [SerializeField] ARTrackedImageManager imageManager;
    [SerializeField] GameObject panelPrefab;
    [SerializeField] GameObject hint;
    // poster is vertical on a wall, cards sit in a row above it, not flat on top of it
    [SerializeField] float spacing = 0.08f;
    [SerializeField] float liftFromMarker = 0.03f;
    [SerializeField] float heightAboveMarker = 0.14f;

    readonly Dictionary<TrackableId, GameObject> roots = new Dictionary<TrackableId, GameObject>();

    void OnEnable()
    {
        imageManager.trackablesChanged.AddListener(OnChanged);
    }

    void OnDisable()
    {
        imageManager.trackablesChanged.RemoveListener(OnChanged);
    }

    void OnChanged(ARTrackablesChangedEventArgs<ARTrackedImage> args)
    {
        foreach (var image in args.added)
            Spawn(image);

        // ARKit keeps the trackable but drops to Limited when the poster leaves the frame,
        // without this the panels stay stuck in the air at the last known pose
        foreach (var image in args.updated)
        {
            if (roots.TryGetValue(image.trackableId, out var root))
            {
                root.SetActive(image.trackingState == TrackingState.Tracking);
                AlignRoot(root.transform);
            }
        }

        foreach (var pair in args.removed)
        {
            if (roots.TryGetValue(pair.Key, out var root))
            {
                Destroy(root);
                roots.Remove(pair.Key);
            }
        }

        UpdateHint();
    }

    // hint only makes sense before the poster is found, hide it once we have a lock
    void UpdateHint()
    {
        if (hint == null)
            return;

        bool anyTracking = false;
        foreach (var image in imageManager.trackables)
        {
            if (image.trackingState == TrackingState.Tracking)
            {
                anyTracking = true;
                break;
            }
        }
        hint.SetActive(!anyTracking);
    }

    // ARKit reports the poster rotated depending on how it was printed, so we ignore its axes:
    // the root keeps the poster position but faces the camera with world up
    void AlignRoot(Transform root)
    {
        var cam = Camera.main;
        if (cam == null)
            return;
        var toCam = cam.transform.position - root.position;
        toCam.y = 0f;
        if (toCam.sqrMagnitude < 0.0001f)
            return;
        root.rotation = Quaternion.LookRotation(-toCam.normalized, Vector3.up);
    }

    void Spawn(ARTrackedImage image)
    {
        if (roots.ContainsKey(image.trackableId))
            return;

        var root = new GameObject("PanelRoot");
        root.transform.SetParent(image.transform, false);
        roots[image.trackableId] = root;
        AlignRoot(root.transform);

        // root is aligned on the world: X = right, Y = up, Z = away from the user
        var products = ProductCatalog.Products;
        for (int i = 0; i < products.Count; i++)
        {
            float t = products.Count == 1 ? 0.5f : (float)i / (products.Count - 1);
            // straight row, 8 cm between card centers (cards are 7 cm wide)
            float x = (t - 0.5f) * spacing * (products.Count - 1);
            var localPos = new Vector3(x, heightAboveMarker, -liftFromMarker);

            var go = Instantiate(panelPrefab, root.transform);
            go.transform.localPosition = localPos;
            go.name = "Panel_" + products[i].name;
            go.GetComponent<ProductPanel>().Bind(products[i]);
        }
    }
}
