using UnityEngine;

/// <summary>Keeps the panel facing the AR camera, upright.</summary>
public class Billboard : MonoBehaviour
{
    Transform cam;

    void LateUpdate()
    {
        if (cam == null)
        {
            if (Camera.main == null)
                return;
            cam = Camera.main.transform;
        }

        // same rotation as the camera, so the card is always parallel to the screen
        transform.rotation = cam.rotation;
    }
}
