namespace MyApp.Application.Common.HelpersExtension
{
    public static class EnumHelpers
    {

        public static string GetDescription(this Enum value) {
            value.GetDescription(); return value.ToString();
        }
    }
}
