using System.Collections.Generic;

/// <summary>Hard coded products of the day. A real app would pull this from the vending machine API.</summary>
public static class ProductCatalog
{
    // "oeuf" without the ligature: the default TMP font atlas has no œ glyph
    public static readonly List<ProductData> Products = new List<ProductData>
    {
        new ProductData(
            "Poêlée de légumes",
            3.95f,
            new[] { "céleri" },
            8,
            "Légumes de Bretagne",
            4,
            "Récoltés en été, surgelés dans les 3 heures après la cueillette."),
        new ProductData(
            "Lasagnes bolognaise",
            4.50f,
            new[] { "gluten", "lait", "oeuf", "céleri" },
            6,
            "Fabriqué en Italie, boeuf français",
            3,
            "La recette vient d'un atelier près de Bologne, la viande est française."),
        new ProductData(
            "Glace vanille",
            2.90f,
            new[] { "lait", "oeuf" },
            0,
            "Vanille de Madagascar",
            30,
            "Gousses de vanille bourbon, infusées 24 heures dans le lait."),
        new ProductData(
            "Pain au chocolat",
            1.60f,
            new[] { "gluten", "lait", "oeuf", "soja" },
            18,
            "Beurre de Charentes-Poitou",
            5,
            "Pâte feuilletée pur beurre, cuisson au four du distributeur en 18 min."),
    };
}
