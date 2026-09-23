using TMPro;
using UnityEngine;
using UnityEngine.UI;

/// <summary>World space card for one product, with a focus mode (bigger, allergens in full) on tap.</summary>
public class ProductPanel : MonoBehaviour
{
    // only one card in focus at a time
    static ProductPanel current;

    [SerializeField] Canvas canvas;
    [SerializeField] Image background;
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
        // world space canvas needs the AR camera for the graphic raycaster
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

        transform.localScale = Vector3.one * focusScale;
        // local Y of the tracked image is its normal, so "up" here means towards the user
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

        transform.localScale = Vector3.one;
        transform.localPosition = restPosition;
        Render();
    }

    void Render()
    {
        if (data == null)
            return;

        var a11y = AccessibilitySettings.Instance;
        float scale = a11y != null ? a11y.TextScale : 1f;
        bool story = a11y != null && a11y.StoryMode;

        title.text = data.name;
        title.fontSize = BaseTitleSize * scale;
        body.fontSize = BaseBodySize * scale;
        detail.fontSize = BaseBodySize * scale;

        string cook = data.cookMinutes > 0 ? data.cookMinutes + " min" : "prêt à manger";
        body.text = data.price.ToString("0.00") + " EUR  |  " + cook;

        if (focused)
        {
            // the point of focus mode: allergens readable from one meter away
            detail.text = "Allergènes : " + data.AllergensLine()
                + "\nOrigine : " + data.origin
                + "\nÀ consommer sous " + data.dlcDays + " j";
            if (story)
                detail.text += "\n\n" + data.story;
        }
        else
        {
            detail.text = "Allergènes : " + data.AllergensLine();
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
        }
    }

    static void Tint(Button b, AccessibilitySettings a11y)
    {
        var img = b.GetComponent<Image>();
        if (img != null) img.color = a11y.ButtonBackground;
        var label = b.GetComponentInChildren<TMP_Text>();
        if (label != null) label.color = a11y.ButtonText;
    }

    static void Haptic()
    {
#if UNITY_IOS || UNITY_ANDROID
        Handheld.Vibrate();
#endif
    }
}
