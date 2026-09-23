using UnityEngine;
using UnityEngine.InputSystem;
using UnityEngine.InputSystem.XR;

/// <summary>iOS 27 workaround: forces portrait and corrects a 90 deg roll between the ARKit pose and the screen.</summary>
// runs before the EventSystem (order 0), so the UI raycasts and the tap ray use the fixed camera
[DefaultExecutionOrder(-100)]
public class OrientationFix : MonoBehaviour
{
    // roll added on top of the tracked pose; a two finger tap cycles 0 / 90 / -90 / 180 to find the right one
    float rollFix = 90f; // not serialized: the scene kept the old 0 otherwise

    static readonly float[] Options = { 0f, 90f, -90f, 180f };
    InputAction posAction;
    InputAction rotAction;

    void Awake()
    {
        Screen.autorotateToLandscapeLeft = false;
        Screen.autorotateToLandscapeRight = false;
        Screen.autorotateToPortraitUpsideDown = false;
        Screen.orientation = ScreenOrientation.Portrait;

        // the driver wrote the pose after us and the roll only came in LateUpdate,
        // so clicks were cast with the wrong camera. We read the same actions ourselves instead.
        var driver = GetComponent<TrackedPoseDriver>();
        if (driver != null)
        {
            posAction = driver.positionInput.action;
            rotAction = driver.rotationInput.action;
            driver.enabled = false;
        }
    }

    void OnEnable()
    {
        posAction?.Enable();
        rotAction?.Enable();
    }

    void Update()
    {
        var ts = Touchscreen.current;
        if (ts != null && ts.touches.Count > 1 && ts.touches[1].press.wasPressedThisFrame)
        {
            int i = System.Array.IndexOf(Options, rollFix);
            rollFix = Options[(i + 1) % Options.Length];
            Debug.Log("[orient] rollFix=" + rollFix);
        }

        if (posAction == null || rotAction == null)
            return;
        var rot = rotAction.ReadValue<Quaternion>();
        // all zero until ARKit sends its first pose
        if (rot.x == 0f && rot.y == 0f && rot.z == 0f && rot.w == 0f)
            return;
        transform.localPosition = posAction.ReadValue<Vector3>();
        transform.localRotation = rot * Quaternion.Euler(0f, 0f, rollFix);
    }
}
