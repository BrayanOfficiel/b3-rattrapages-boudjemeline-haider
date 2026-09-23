using System;

/// <summary>One frozen product shown on a floating panel.</summary>
[Serializable]
public class ProductData
{
    public string name;
    public float price;
    public string[] allergens;
    public int cookMinutes;
    public string origin;
    public int dlcDays;
    public string story;

    public ProductData(string name, float price, string[] allergens, int cookMinutes, string origin, int dlcDays, string story)
    {
        this.name = name;
        this.price = price;
        this.allergens = allergens;
        this.cookMinutes = cookMinutes;
        this.origin = origin;
        this.dlcDays = dlcDays;
        this.story = story;
    }

    /// <summary>Allergens as one readable line, "aucun" when the list is empty.</summary>
    public string AllergensLine()
    {
        if (allergens == null || allergens.Length == 0)
            return "aucun";
        return string.Join(", ", allergens);
    }
}
