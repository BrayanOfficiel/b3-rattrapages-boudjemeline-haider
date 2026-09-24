using System;
using TMPro;
using UnityEngine;
using UnityEngine.UI;

/// <summary>display settings, contrast and text size, from the hud buttons</summary>
public class AccessibilitySettings : MonoBehaviour
{
    public static AccessibilitySettings Instance { get; private set; }

    /// <summary>fires when a setting changes, panels redraw</summary>
    public static event Action Changed;

    [SerializeField] TMP_Text contrastLabel;
    [SerializeField] TMP_Text textLabel;
    [SerializeField] TMP_Text storyLabel;

    // hud buttons, tinted too in high contrast
    [SerializeField] Image contrastButton;
    [SerializeField] Image textButton;
    [SerializeField] Image storyButton;

    // scale applies to whole card, not just font
    static readonly float[] Scales = { 1f, 1.3f, 1.6f };
    int scaleIndex;

    public bool HighContrast { get; private set; }
    public float TextScale => Scales[scaleIndex];

    // todo not really a11y, move to own script
    public bool StoryMode { get; private set; }

    // normal mode: white card, navy text
    // contrast mode: black card, white text, yellow price
    public Color PanelBackground => HighContrast ? Color.black : new Color(1f, 1f, 1f, 0.9f);
    public Color PanelText => HighContrast ? Color.white : new Color(0.10f, 0.20f, 0.40f);
    public Color PanelAccent => HighContrast ? new Color(1f, 0.87f, 0f) : new Color(0.75f, 0.10f, 0.10f);
    public Color ButtonBackground => HighContrast ? Color.white : new Color(0.10f, 0.20f, 0.40f);
    public Color ButtonText => HighContrast ? Color.black : Color.white;
    // 4px border in contrast mode, none in normal
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
