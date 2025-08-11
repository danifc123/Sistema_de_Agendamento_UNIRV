using System.Text.Json;
using System.Text.Json.Serialization;

namespace SeuProjeto.Converters
{
    public class TimeOnlyConverter : JsonConverter<TimeOnly>
    {
        public override TimeOnly Read(ref Utf8JsonReader reader, Type typeToConvert, JsonSerializerOptions options)
        {
            var timeString = reader.GetString();
            if (TimeOnly.TryParse(timeString, out var time))
            {
                return time;
            }
            throw new JsonException($"Unable to parse time: {timeString}");
        }

        public override void Write(Utf8JsonWriter writer, TimeOnly value, JsonSerializerOptions options)
        {
            writer.WriteStringValue(value.ToString("HH:mm"));
        }
    }
} 