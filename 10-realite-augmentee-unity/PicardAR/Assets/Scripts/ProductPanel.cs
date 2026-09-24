using TMPro;
using UnityEngine;
using UnityEngine.UI;

/// <summary>card for one product, focus mode shows more on tap</summary>
public class ProductPanel : MonoBehaviour
{
    // only one card in focus at a time
    static ProductPanel current;

    [SerializeField] Canvas canvas;
    [SerializeField] Image background;
    [SerializeField] Outline border;
    [SerializeField] TMP_Text title;
    [SerializeField] TMP_Text body;
    [SerializeField] TMP_Text detail;
    [SerializeField] Button infoButton;
    [SerializeField] Button backButton;
    [SerializeField] float focusScale = 1.8f;
    [SerializeField] float focusLift = 0.06f;

    ProductData data;
    Vector3 restPosition;
    bool focused;

    const float BaseTitleSize = 30f;
    const float BaseBodySize = 20f;

    public bool Focused => focused;

    void Awake()
    {
        // world space canvas needs ar camera for click check
        if (canvas != null && canvas.worldCamera == null)
            canvas.worldCamera = Camera.main;

        infoButton.onClick.AddListener(Focus);
        backButton.onClick.AddListener(Unfocus);
    }

    void OnEnable()
    {
        AccessibilitySettings.Changed += Render;
    }

    void OnDisable()
    {
        AccessibilitySettings.Changed -= Render;
    }

    public void Bind(ProductData product)
    {
        data = product;
        restPosition = transform.localPosition;
        Render();
    }

    public void Toggle()
    {
        if (focused) Unfocus();
        else Focus();
    }

    public void Focus()
    {
        if (current != null && current != this)
            current.Unfocus();
        current = this;
        focused = true;

        // local y is the image normal, up means toward user
        transform.localPosition = restPosition + Vector3.up * focusLift;
        Haptic();
        Render();
    }

    public void Unfocus()
    {
        if (!focused)
            return;
        focused = false;
        if (current == this)
            current = null;

        transform.localPosition = restPosition;
        Render();
    }

    void Render()
    {
        if (data == null)
            return;

        var a11y = AccessibilitySettings.Instance;
        float textScale = a11y != null ? a11y.TextScale : 1f;
        bool story = a11y != null && a11y.StoryMode;

        // whole card scales up, font size stays fixed
        title.fontSize = BaseTitleSize;
        body.fontSize = BaseBodySize;
        detail.fontSize = BaseBodySize;
        transform.localScale = Vector3.one * textScale * (focused ? focusScale : 1f);

        title.text = data.name;

        if (story)
        {
            // story mode: origin and how its made
            body.text = "Origine : " + data.origin;
            detail.text = data.story;
        }
        else
        {
            string cook = data.cookMinutes > 0 ? data.cookMinutes + " min" : "prêt à manger";
            body.text = data.price.ToString("0.00") + " EUR  |  " + cook;

            if (focused)
            {
                // focus mode, allergens readable from far
                detail.text = "Allergènes : " + data.AllergensLine()
                    + "\nOrigine : " + data.origin
                    + "\nÀ consommer sous " + data.dlcDays + " j";
            }
            else
            {
                detail.text = "Allergènes : " + data.AllergensLine();
            }
        }

        infoButton.gameObject.SetActive(!focused);
        backButton.gameObject.SetActive(focused);

        if (a11y != null)
        {
            background.color = a11y.PanelBackground;
            title.color = a11y.PanelText;
            body.color = a11y.PanelAccent;
            detail.color = a11y.PanelText;
            Tint(infoButton, a11y);
            Tint(backButton, a11y);

            if (border != null)
            {
                border.effectColor = a11y.PanelBorderColor;
                border.effectDistance = Vector2.one * a11y.PanelBorderWidth;
                border.enabled = a11y.PanelBorderWidth > 0f;
            }
        }
    }

    static void Tint(Button b, AccessibilitySettings a11y)
    {
        var img = b.GetComponent<Image>();
        if (img != null) img.color = a11y.ButtonBackground;
        var label = b.GetComponentInChildren<TMP_Text>(true);
        if (label != null) label.color = a11y.ButtonText;
    }

    static void Haptic()
    {
#if UNITY_IOS || UNITY_ANDROID
        Handheld.Vibrate();
#endif
    }
}
