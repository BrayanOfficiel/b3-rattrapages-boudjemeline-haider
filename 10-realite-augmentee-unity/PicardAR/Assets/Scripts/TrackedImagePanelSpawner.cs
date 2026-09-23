using System.Collections.Generic;
using UnityEngine;
using UnityEngine.XR.ARFoundation;
using UnityEngine.XR.ARSubsystems;

/// <summary>Spawns the product panels in an arc above the Picard marker once it is tracked.</summary>
public class TrackedImagePanelSpawner : MonoBehaviour
{
    [SerializeField] ARTrackedImageManager imageManager;
    [SerializeField] GameObject panelPrefab;
    [SerializeField] float radius = 0.22f;
    [SerializeField] float arcDegrees = 110f;
    [SerializeField] float liftFromMarker = 0.03f;

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
                root.SetActive(image.trackingState == TrackingState.Tracking);
        }

        foreach (var pair in args.removed)
        {
            if (roots.TryGetValue(pair.Key, out var root))
            {
                Destroy(root);
                roots.Remove(pair.Key);
            }
        }
    }

    void Spawn(ARTrackedImage image)
    {
        if (roots.ContainsKey(image.trackableId))
            return;

        var root = new GameObject("PanelRoot");
        root.transform.SetParent(image.transform, false);
        roots[image.trackableId] = root;

        // tracked image space: X right, Y = normal (towards the user), Z = top of the poster
        var products = ProductCatalog.Products;
        for (int i = 0; i < products.Count; i++)
        {
            float t = products.Count == 1 ? 0.5f : (float)i / (products.Count - 1);
            float a = Mathf.Lerp(-arcDegrees * 0.5f, arcDegrees * 0.5f, t) * Mathf.Deg2Rad;
            var localPos = new Vector3(Mathf.Sin(a) * radius, liftFromMarker, Mathf.Cos(a) * radius);

            var go = Instantiate(panelPrefab, root.transform);
            go.transform.localPosition = localPos;
            go.name = "Panel_" + products[i].name;
            go.GetComponent<ProductPanel>().Bind(products[i]);
        }
    }
}
