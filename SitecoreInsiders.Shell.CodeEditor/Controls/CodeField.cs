using Sitecore.Diagnostics;
using Sitecore.Shell.Applications.ContentEditor;
using Sitecore.Text;
using Sitecore.Web;
using Sitecore.Web.UI.Sheer;
using System;


namespace SitecoreInsiders.Shell.CodeEditor.Controls
{
    public class CodeField : Memo
    {
        public CodeField()
        {
            Class = "scContentControlMemo";
            Activation = true;
        }

        public override void HandleMessage(Message message)
        {
            Assert.ArgumentNotNull(message, "message");
            base.HandleMessage(message);

            if (message["id"] != ID)
                return;

            switch (message.Name)
            {
                //message defined in Menu item
                case "codefield:editcode":
                    OpenEditor();
                    break;

                default:
                    return;
            }
        }

        protected void OpenEditor()
        {
            Sitecore.Context.ClientPage.Start((object)this, "EditCode");
        }

        /// <summary>Opens the Code Editor dialog or handles dialog result.</summary>
        /// <param name="args">The args.</param>
        protected void EditCode(ClientPipelineArgs args)
        {
            Assert.ArgumentNotNull((object)args, nameof(args));
            if (this.Disabled)
                return;

            if (args.IsPostBack)
            {
                //cancel button will return "undefined"
                if (string.IsNullOrEmpty(args.Result) || args.Result == "undefined")
                    return;

                var text = string.Empty;
                //because returning empty string always return "undefined", 
                //when we want to clear the value in the editor, we set it as this string.
                if (args.Result != "__#!$No value$!#__")                    
                {
                    text = args.Result;
                }

                if (text != this.Value)
                {
                    this.Value = text;
                    this.SetModified();
                }
                Sitecore.Context.ClientPage.ClientResponse.SetAttribute(this.ID, "value", this.Value);
            }
            else
            {
                UrlString urlString = new UrlString("/sitecore/client/Applications/Dialogs/CodeEditor");
                UrlHandle urlHandle = new UrlHandle();
                urlHandle["CodeText"] = this.Value;
                urlHandle.Add(urlString);
                ModalDialogOptions options = new ModalDialogOptions(urlString.ToString())
                {
                    Width = "1000",
                    Height = "600",
                    Response = true
                };
                SheerResponse.ShowModalDialog(options);
                args.WaitForPostBack();
            }
        }

    }

}
