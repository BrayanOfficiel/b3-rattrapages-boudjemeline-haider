using System;
using TMPro;
using UnityEngine;

/// <summary>Global display settings (contrast, text size) driven by the two screen space buttons.</summary>
public class AccessibilitySettings : MonoBehaviour
{
    public static AccessibilitySettings Instance { get; private set; }

    /// <summary>Raised when a setting changes, panels re-render on it.</summary>
    public static event Action Changed;

    [SerializeField] TMP_Text contrastLabel;
    [SerializeField] TMP_Text textLabel;
    [SerializeField] TMP_Text storyLabel;

    // 1.0, 1.4, 1.8 : WCAG 1.4.4 asks for 200% without loss, 1.8 is what fits on the panel
    static readonly float[] Scales = { 1f, 1.4f, 1.8f };
    int scaleIndex;

    public bool HighContrast { get; private set; }
    public float TextScale => Scales[scaleIndex];

    // not really a11y but the HUD lives here, TODO move to its own script
    public bool StoryMode { get; private set; }

    // normal mode: white card at 90% over the camera feed, navy text (about 10:1 on white)
    // contrast + : opaque black card, white text (21:1), and yellow for the price
    public Color PanelBackground => HighContrast ? Color.black : new Color(1f, 1f, 1f, 0.9f);
    public Color PanelText => HighContrast ? Color.white : new Color(0.10f, 0.20f, 0.40f);
    public Color PanelAccent => HighContrast ? new Color(1f, 0.87f, 0f) : new Color(0.75f, 0.10f, 0.10f);
    public Color ButtonBackground => HighContrast ? Color.white : new Color(0.10f, 0.20f, 0.40f);
    public Color ButtonText => HighContrast ? Color.black : Color.white;

    void Awake()
    {
        if (Instance != null && Instance != this)
        {
            Destroy(gameObject);
            return;
        }
        Instance = this;
    }

    void Start()
    {
        RefreshLabels();
    }

    public void ToggleContrast()
    {
        HighContrast = !HighContrast;
        Notify();
    }

    public void CycleTextScale()
    {
        scaleIndex = (scaleIndex + 1) % Scales.Length;
        Notify();
    }

    public void ToggleStory()
    {
        StoryMode = !StoryMode;
        Notify();
    }

    void Notify()
    {
        RefreshLabels();
        Changed?.Invoke();
    }

    void RefreshLabels()
    {
        if (contrastLabel != null)
            contrastLabel.text = HighContrast ? "Contraste : fort" : "Contraste +";
        if (textLabel != null)
            textLabel.text = "Texte " + Mathf.RoundToInt(TextScale * 100) + " %";
        if (storyLabel != null)
            storyLabel.text = StoryMode ? "Coulisses : on" : "Coulisses";
    }
}
