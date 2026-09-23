using UnityEngine;
using UnityEngine.InputSystem;
using UnityEngine.InputSystem.XR;

/// <summary>iOS 27 workaround: forces portrait and corrects a 90 deg roll between the ARKit pose and the screen.</summary>
public class OrientationFix : MonoBehaviour
{
    // roll added on top of the tracked pose; a two finger tap cycles 0 / 90 / -90 / 180 to find the right one
    float rollFix = 90f; // not serialized: the scene kept the old 0 otherwise

    static readonly float[] Options = { 0f, 90f, -90f, 180f };
    Quaternion lastFixed;

    void Awake()
    {
        Screen.autorotateToLandscapeLeft = false;
        Screen.autorotateToLandscapeRight = false;
        Screen.autorotateToPortraitUpsideDown = false;
        Screen.orientation = ScreenOrientation.Portrait;

        // pose written in Update only, so LateUpdate below always comes after it
        var driver = GetComponent<TrackedPoseDriver>();
        if (driver != null)
            driver.updateType = TrackedPoseDriver.UpdateType.Update;
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
    }

    void LateUpdate()
    {
        // skip if the driver did not write a new pose this frame, otherwise the roll piles up
        if (rollFix == 0f || transform.localRotation == lastFixed)
            return;
        transform.localRotation *= Quaternion.Euler(0f, 0f, rollFix);
        lastFixed = transform.localRotation;
    }
}
