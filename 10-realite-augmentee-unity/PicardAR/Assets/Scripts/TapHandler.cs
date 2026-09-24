using UnityEngine;
using UnityEngine.EventSystems;
using UnityEngine.InputSystem;
using UnityEngine.InputSystem.EnhancedTouch;
using Touch = UnityEngine.InputSystem.EnhancedTouch.Touch;

/// <summary>tap on card body toggles focus, buttons handled elsewhere</summary>
// runs after event system so pointer check sees this touch
[DefaultExecutionOrder(100)]
public class TapHandler : MonoBehaviour
{
    [SerializeField] float maxDistance = 5f;

    Camera cam;

    void OnEnable()
    {
        EnhancedTouchSupport.Enable();
    }

    void OnDisable()
    {
        EnhancedTouchSupport.Disable();
    }

    void Update()
    {
        if (cam == null)
        {
            cam = Camera.main;
            if (cam == null)
                return;
        }

        foreach (var touch in Touch.activeTouches)
        {
            if (!touch.began)
                continue;
            if (EventSystem.current != null && EventSystem.current.IsPointerOverGameObject(touch.touchId))
                continue;
            TryHit(touch.screenPosition);
        }

        // mouse for XR Simulation in the editor
        if (Mouse.current != null && Mouse.current.leftButton.wasPressedThisFrame)
        {
            if (EventSystem.current != null && EventSystem.current.IsPointerOverGameObject())
                return;
            TryHit(Mouse.current.position.ReadValue());
        }
    }

    void TryHit(Vector2 screenPos)
    {
        var ray = cam.ScreenPointToRay(screenPos);
        if (!Physics.Raycast(ray, out var hit, maxDistance))
            return;

        var panel = hit.collider.GetComponentInParent<ProductPanel>();
        if (panel != null)
            panel.Toggle();
        // Debug.Log("tap hit " + hit.collider.name);
    }
}
