using System;
using TMPro;
using UnityEngine;
using UnityEngine.UI;

/// <summary>Global display settings (contrast, text size) driven by the two screen space buttons.</summary>
public class AccessibilitySettings : MonoBehaviour
{
    public static AccessibilitySettings Instance { get; private set; }

    /// <summary>Raised when a setting changes, panels re-render on it.</summary>
    public static event Action Changed;

    [SerializeField] TMP_Text contrastLabel;
    [SerializeField] TMP_Text textLabel;
    [SerializeField] TMP_Text storyLabel;

    // HUD buttons, tinted too when high contrast is on
    [SerializeField] Image contrastButton;
    [SerializeField] Image textButton;
    [SerializeField] Image storyButton;

    // 1.0, 1.3, 1.6 applied to the whole card transform, not just the font size
    static readonly float[] Scales = { 1f, 1.3f, 1.6f };
    int scaleIndex;

    public bool HighContrast { get; private set; }
    public float TextScale => Scales[scaleIndex];

    // not really a11y but the HUD lives here, TODO move to its own script
    public bool StoryMode { get; private set; }

    // normal mode: white card at 90% over the camera feed, navy text (about 10:1 on white)
    // contrast + : opaque black card, pure white text (21:1), and yellow for the price
    public Color PanelBackground => HighContrast ? Color.black : new Color(1f, 1f, 1f, 0.9f);
    public Color PanelText => HighContrast ? Color.white : new Color(0.10f, 0.20f, 0.40f);
    public Color PanelAccent => HighContrast ? new Color(1f, 0.87f, 0f) : new Color(0.75f, 0.10f, 0.10f);
    public Color ButtonBackground => HighContrast ? Color.white : new Color(0.10f, 0.20f, 0.40f);
    public Color ButtonText => HighContrast ? Color.black : Color.white;
    // 4 px border around the cards in contrast mode, nothing in normal mode
    public float PanelBorderWidth => HighContrast ? 4f : 0f;
    public Color PanelBorderColor => Color.white;

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
            contrastLabel.text = HighContrast ? "Light mode" : "Dark mode";
        if (textLabel != null)
            textLabel.text = "Texte " + Mathf.RoundToInt(TextScale * 100) + " %";
        if (storyLabel != null)
            storyLabel.text = StoryMode ? "Produits" : "Coulisses";

    }

    void TintHudButton(Image button, TMP_Text label)
    {
        if (button != null)
            button.color = ButtonBackground;
        if (label != null)
            label.color = ButtonText;
    }
}
