using System;
using System.IO;
using SkiaSharp;

class Program
{
    static void Main(string[] args)
    {
        // Ruta de la imagen que deseas convertir
        string imagePath = @"ine.png";  // Cambia a la ruta de tu imagen

        // Convertir la imagen a Base64
        string base64String = ConvertImageToBase64(imagePath);

        // Imprimir la cadena Base64
        Console.WriteLine(base64String);
    }

    static string ConvertImageToBase64(string imagePath)
    {
        // Leer la imagen desde la ruta proporcionada usando SkiaSharp
        using (var inputStream = File.OpenRead(imagePath))
        {
            using (var bitmap = SKBitmap.Decode(inputStream))
            {
                using (var image = SKImage.FromBitmap(bitmap))
                {
                    using (var data = image.Encode(SKEncodedImageFormat.Jpeg, 100))  // Puedes cambiar el formato si es necesario
                    {
                        // Convertir la imagen a bytes y luego a Base64
                        byte[] imageBytes = data.ToArray();
                        return Convert.ToBase64String(imageBytes);
                    }
                }
            }
        }
    }
}
