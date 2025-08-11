using System.Text.Json;
using System.Text.Json.Serialization;

namespace SeuProjeto.Converters
{
    public class DateOnlyConverter : JsonConverter<DateOnly>
    {
        public override DateOnly Read(ref Utf8JsonReader reader, Type typeToConvert, JsonSerializerOptions options)
        {
            var dateString = reader.GetString();
            if (DateOnly.TryParse(dateString, out var date))
            {
                return date;
            }
            throw new JsonException($"Unable to parse date: {dateString}");
        }

        public override void Write(Utf8JsonWriter writer, DateOnly value, JsonSerializerOptions options)
        {
            writer.WriteStringValue(value.ToString("yyyy-MM-dd"));
        }
    }
} 