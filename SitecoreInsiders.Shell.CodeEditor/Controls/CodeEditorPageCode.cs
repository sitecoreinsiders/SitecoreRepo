using Sitecore.Diagnostics;
using Sitecore.Web;
using Sitecore.Web.PageCodes;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace SitecoreInsiders.Shell.CodeEditor.Controls
{
    public class CodeEditorPageCode : PageCodeBase
    {
        public Sitecore.Mvc.Presentation.Rendering CodeText { get; set; }

        public override void Initialize()
        {
            UrlHandle urlHandle;
            UrlHandle.TryGetHandle(out urlHandle);
            if (urlHandle == null)
                return;
            var codeText = urlHandle["CodeText"];
            this.CodeText.Parameters["Text"] = codeText;
        }
    }
}
