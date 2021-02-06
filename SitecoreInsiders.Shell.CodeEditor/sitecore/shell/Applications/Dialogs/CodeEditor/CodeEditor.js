$('head').append('<link rel="stylesheet" type="text/css" href="/sitecore/shell/Applications/Dialogs/CodeEditor/codemirror-5.59.2/lib/codemirror.css">');
$('head').append('<link rel="stylesheet" type="text/css" href="/sitecore/shell/Applications/Dialogs/CodeEditor/codemirror-5.59.2/addon/hint/show-hint.css">');
$('head').append('<link rel="stylesheet" type="text/css" href="/sitecore/shell/Applications/Dialogs/CodeEditor/codemirror-5.59.2/addon/lint/lint.css">');

require.config({
    baseUrl: "/sitecore/shell/Applications/Dialogs/CodeEditor",
    paths: {
        "jshint": "https://cdnjs.cloudflare.com/ajax/libs/jshint/2.6.3/jshint",
    },
    waitSeconds: 40,
    packages: [{
        name: "codemirror",
        location: "/sitecore/shell/Applications/Dialogs/CodeEditor/codemirror-5.59.2",
        main: "lib/codemirror"
    }],
});

define(["sitecore",
    "codemirror",
    "codemirror/mode/javascript/javascript",
    "codemirror/addon/hint/show-hint",
    "codemirror/addon/hint/anyword-hint",
    "codemirror/addon/hint/javascript-hint",
    "codemirror/addon/lint/lint",
    "codemirror/addon/lint/javascript-lint",
    "jshint",], function (Sitecore, CodeMirror) {

        var CodeEditorDialog = Sitecore.Definitions.App.extend({
            CodeEditor: {},
            save: function () {
                this.CodeEditor.save();
                var text = this.CodeEditor.getTextArea().value;
                if (!text.trim())
                    text = "__#!$No value$!#__";

                this.CodeText.set("text", text);
            },
            initialized: function () {
                var self = this;
                var element = document.querySelectorAll('[data-sc-id="CodeText"]')[0];
                this.CodeEditor = CodeMirror.fromTextArea(element, {
                    lineNumbers: true,
                    mode: { name: "javascript" },
                    indentWithTabs: true,
                    lint: true,
                    hint: CodeMirror.hint.javascript,
                    autohint: true,
                    extraKeys: { "Shift-Space": "autocomplete" },
                    gutters: ["CodeMirror-lint-markers"],
                    readOnly: false,
                    matchBrackets: true,
                    autoCloseBrackets: true
                });

                var self = this;
                var updateTextArea = function () {

                    if (self.CodeEditor.doc.getValue() != self.CodeText.get("text"))
                        self.SaveButton.set("isEnabled", true);
                    else
                        self.SaveButton.set("isEnabled", false);
                };
                this.CodeEditor.on('change', updateTextArea, this);

                this.SaveButton.set("isEnabled", false);

            }

        });

        return CodeEditorDialog;
    });