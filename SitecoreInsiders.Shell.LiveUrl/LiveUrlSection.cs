using Sitecore.Configuration;
using Sitecore.Data.Items;
using Sitecore.Links;
using Sitecore.Links.UrlBuilders;
using Sitecore.Shell.Applications.ContentEditor.Pipelines.RenderContentEditor;
using Sitecore.Sites;
using Sitecore.StringExtensions;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.UI;

namespace SitecoreInsiders.Shell.LiveUrl
{
   public class LiveUrlSection
   {
      protected IList<string> Scripts = new List<string>();

      public void AddScriptResource(string resource)
      {
         Scripts.Add(resource);
      }

      public void Process(RenderContentEditorArgs args)
      {
         if (args?.Item == null) return;

         InjectContentEditorScripts();
         
         using (new SiteContextSwitcher(Factory.GetSite(GetSite(args.Item)?.Name)))
         {
            var isContentItem = args.Item.Paths.FullPath.StartsWith(Sitecore.Context.Site.StartPath);
            var hasPresentationDetails = !string.IsNullOrEmpty(args.Item.Fields[Sitecore.FieldIDs.LayoutField]?.Value);
            var isMediaItem = args.Item.Paths.IsMediaItem;

            if ((!isContentItem || !hasPresentationDetails) && !isMediaItem) return;

            var masterUrl = isContentItem ? GetUrl(args.Item) : GetMediaUrl(args.Item);

            var webDb = Factory.GetDatabase("web");
            var webItem = webDb?.GetItem(args.Item.ID);
            var webUrl = isContentItem ? GetUrl(webItem) : GetMediaUrl(webItem);

            Render(args, masterUrl, webUrl);
         }
      }

private void InjectContentEditorScripts()
{
   if (!(HttpContext.Current.Handler is Page handler)) return;

   foreach (var script in Scripts)
   {
      handler.Header.Controls.Add(new LiteralControl("<script type='text/javascript' language='javascript' src='{0}'></script>".FormatWith((object)script)));
   }
}

      private static void Render(RenderContentEditorArgs args, string masterUrl, string webUrl)
      {
         const string copyUrlHtml = "<a href=\"#\" class=\"scContentButton scCopyUrl\">Copy URL</a>";

         args.EditorFormatter.RenderSectionBegin(args.Parent, "LiveUrlSection", "LiveUrlSection", "URL", string.Empty, false, true);
         args.EditorFormatter.AddLiteralControl(args.Parent, "<table class='scEditorQuickInfo'><tbody>");

         if (masterUrl != webUrl)
         {
            args.EditorFormatter.AddLiteralControl(args.Parent, $"<tr><td>Preview URL:</td><td><span>{masterUrl}</span> {copyUrlHtml}</td></tr>");
         }

         var html = string.IsNullOrEmpty(webUrl)
            ? "This item is not published."
            : $"<span>{webUrl}</span> {copyUrlHtml}";

         args.EditorFormatter.AddLiteralControl(args.Parent, $"<tr><td>Live URL:</td><td>{html}</td></tr>");

         args.EditorFormatter.AddLiteralControl(args.Parent, "</tbody></table>");
         args.EditorFormatter.RenderSectionEnd(args.Parent, true, false);
      }

      private static string GetUrl(Item item)
      {
         if (item == null) return null;

         var itemUrlBuilderOptions = new ItemUrlBuilderOptions
         {
            SiteResolving = true,
            LowercaseUrls = true,
            AlwaysIncludeServerUrl = true
         };

         return LinkManager.GetItemUrl(item, itemUrlBuilderOptions);
      }

      private static string GetMediaUrl(Item item)
      {
         if (item == null) return null;

         var mediaItem = new MediaItem(item);

         var mediaOptions = new MediaUrlBuilderOptions
         {
            AlwaysIncludeServerUrl = true,
            LowercaseUrls = true
         };

         return Sitecore.Resources.Media.MediaManager.GetMediaUrl(mediaItem, mediaOptions);
      }

      private static Sitecore.Web.SiteInfo GetSite(Item item)
      {
         var siteInfoList = Factory.GetSiteInfoList();

         return item.Paths.IsMediaItem
            ? siteInfoList.FirstOrDefault(siteInfo => !string.IsNullOrEmpty(siteInfo.HostName))
            : siteInfoList.OrderByDescending(x => x.RootPath.Length)
               .FirstOrDefault(siteInfo => item.Paths.FullPath.StartsWith(siteInfo.RootPath));
      }
   }
}