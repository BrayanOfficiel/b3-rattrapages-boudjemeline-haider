using UnityEngine;

/// <summary>keep panel facing the ar camera</summary>
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

        // same rotation as camera, card stays parallel to screen
        transform.rotation = cam.rotation;
    }
}
