$code = @'
using System;
using System.Net;
using System.IO;
using System.Text;

public class SimpleServer3 {
    public static void Start(string dir, int port) {
        string prefix = string.Format("http://localhost:{0}/", port);
        HttpListener listener = new HttpListener();
        listener.Prefixes.Add(prefix);
        listener.Start();
        Console.WriteLine("Serving " + dir + " at " + prefix);
        while (true) {
            try {
                HttpListenerContext ctx = listener.GetContext();
                string url = ctx.Request.Url.AbsolutePath.TrimStart('/');
                if (string.IsNullOrEmpty(url)) url = "loveletter.html";
                url = Uri.UnescapeDataString(url);
                string path = Path.Combine(dir, url);
                if (File.Exists(path)) {
                    string ext = Path.GetExtension(path).ToLower();
                    string mime = "application/octet-stream";
                    if (ext == ".html") mime = "text/html; charset=utf-8";
                    else if (ext == ".mp3") mime = "audio/mpeg";
                    else if (ext == ".css") mime = "text/css";
                    else if (ext == ".js") mime = "application/javascript";
                    else if (ext == ".png") mime = "image/png";
                    else if (ext == ".jpg" || ext == ".jpeg") mime = "image/jpeg";
                    else if (ext == ".svg") mime = "image/svg+xml";
                    else if (ext == ".json") mime = "application/json";
                    byte[] bytes = File.ReadAllBytes(path);
                    ctx.Response.ContentType = mime;
                    ctx.Response.ContentLength64 = bytes.Length;
                    ctx.Response.AddHeader("Access-Control-Allow-Origin", "*");
                    ctx.Response.OutputStream.Write(bytes, 0, bytes.Length);
                    ctx.Response.OutputStream.Close();
                } else {
                    ctx.Response.StatusCode = 404;
                    byte[] msg = Encoding.UTF8.GetBytes("Not Found: " + url);
                    ctx.Response.OutputStream.Write(msg, 0, msg.Length);
                    ctx.Response.OutputStream.Close();
                }
            } catch (Exception ex) {
                Console.WriteLine("Error: " + ex.Message);
            }
        }
    }
}
'@

Add-Type -TypeDefinition $code -Language CSharp
[SimpleServer3]::Start("C:\Users\Lenovo\AppData\Local\Temp\loveletter-site", 8765)
