$('head').append('<link rel="stylesheet" type="text/css" href="/sitecore/shell/Applications/Dialogs/CodeEditor/CodeEditor.css">');

//hide Sitecore textarea, it's only need to hold the value
const codeTextArea = document.querySelectorAll('[data-sc-id="CodeText"]')[0];
codeTextArea.style.display = "none";

require.config({
    paths: {
        'vs': 'https://cdnjs.cloudflare.com/ajax/libs/monaco-editor/0.22.3/min/vs',
    }
});

define(["sitecore",
    "vs/editor/editor.main",
], function (Sitecore, monaco) {
    //required if always using a nameless function (callback) in your field
    const ignoreFirstLineErrors = true;

    const containerId = 'monacoCodeEditorsContainer';
    const monacoEditorId = 'monacoCodeEditor';
    const monacoDiffEditorId = 'monacoDiffEditor';
    const diffModeButtonId = 'diffModeSwitchButton';
    const themeSwitchButtonId = 'themeSwitchButton';
    const switchDiffModeTextButton = ['Diff mode', 'Editor mode'];

    //add a container for editor and diff editor 
    const editorsContainer = document.createElement('div');
    editorsContainer.classList.add('monaco-editors-container');
    editorsContainer.setAttribute("id", containerId);

    codeTextArea.before(editorsContainer, codeTextArea);

    var CodeEditorDialog = Sitecore.Definitions.App.extend({
        CodeEditor: {},
        CodeDiff: {},
        InitialVersionId: null,
        CodeModel: null,
        save: function () {
            this.SaveButton.set('text', 'Saving...');
            this.SaveButton.set("isEnabled", false);

            let text = this.CodeEditor.getValue();
            if (!text.trim())
                text = "__#!$No value$!#__";

            this.CodeText.set("text", text);
        },
        createSwitchButton: function (buttonId, text, callback) {
            const button = document.createElement('a');
            codeTextArea.before(button, document.getElementById(containerId));

            button.setAttribute("id", buttonId);
            button.className = "monaco-diff-button";
            button.innerText = text;
            button.addEventListener("click", callback);
        },
        switchTheme: function () {
            const currentTheme = this.CodeEditor._themeService._theme.id;

            monaco.editor.setTheme('vs' + (currentTheme == 'vs' ? '-dark' : ''));
            document.body.classList.toggle('vs-white');
        },
        createEditor: function (element) {
            this.CodeModel = monaco.editor.createModel(this.CodeText.get('text'), "javascript");

            //save initial id to check if changes were reverted by undo and the text is not really changed
            this.InitialVersionId = this.CodeModel.getAlternativeVersionId();

            this.CodeEditor = monaco.editor.create(element, {
                model: this.CodeModel,
                language: 'javascript',
                theme: 'vs-dark',
                automaticLayout: true,
                glyphMargin: true
            });

            var self = this;
            //check if data changed
            this.CodeEditor.onDidChangeModelContent((e) => {
                var isDirty = (self.InitialVersionId !== self.CodeModel.getAlternativeVersionId());
                self.SaveButton.set("isEnabled", isDirty);
            });

            var decorations = this.CodeEditor.deltaDecorations([], []);
            //filter first line if ignoreFirstLineErrors or if there is an higher severity entry that override the line mark type
            const markersFilter = (entry, index, self) => {
                return (!ignoreFirstLineErrors || entry.startLineNumber > 1) && self.findIndex((e) => e.startLineNumber == entry.startLineNumber) === index;
            }

            monaco.editor.onDidChangeMarkers((e) => {
                var modelMarkers = monaco.editor.getModelMarkers({});
                modelMarkers = modelMarkers.sort((x, y) => y.severity - x.severity);

                var markers = modelMarkers.filter(markersFilter).map(x => {
                    return {
                        range: new monaco.Range(x.startLineNumber, x.startColumn, x.endLineNumber, x.endColumn),
                        options: {
                            isWholeLine: true,
                            className: x.severity > 5 ? 'monaco-line-error' : 'monaco-line-warn',
                            glyphMarginClassName: x.severity > 5 ? 'monaco-margin-error' : 'monaco-margin-warn',
                        }
                    }
                });
                decorations = this.CodeEditor.deltaDecorations(decorations, markers);
            })
        },
        createDiffEditor: function () {
            const diffEditorElement = document.createElement('div');
            editorsContainer.appendChild(diffEditorElement);

            diffEditorElement.setAttribute("id", monacoDiffEditorId);
            diffEditorElement.classList.add('monaco-editor');

            this.CodeDiff = monaco.editor.createDiffEditor(diffEditorElement, {
                automaticLayout: true
            });

            const originalModel = monaco.editor.createModel(this.CodeText.get('text'), "javascript");

            this.CodeDiff.setModel({
                original: originalModel,
                modified: this.CodeModel
            });

            return diffEditorElement;
        },
        switchDiffMode: function () {
            const button = document.getElementById(diffModeButtonId);
            let diffEditorElement = document.getElementById(monacoDiffEditorId);
            const container = document.getElementById(containerId);
            const normalEditor = document.getElementById(monacoEditorId);

            if (!diffEditorElement) {
                diffEditorElement = this.createDiffEditor();
            }

            if (!button.className.match(/\bdiffEditorOn\b/)) {
                button.innerText = switchDiffModeTextButton[1];
                diffEditorElement.style.display = "inherit";
                normalEditor.style.display = "none";
            } else {
                button.innerText = switchDiffModeTextButton[0];
                diffEditorElement.style.display = "none";
                normalEditor.style.display = "inherit";
            }
            button.classList.toggle('diffEditorOn');
            container.classList.toggle('monaco-diff-editor');
        },
        initialized: function () {
            const editorDiv = document.createElement('div');
            editorsContainer.appendChild(editorDiv);
            editorDiv.classList.add('monaco-editor');
            editorDiv.setAttribute("id", "monacoCodeEditor");

            this.createEditor(editorDiv);

            this.createSwitchButton(diffModeButtonId, switchDiffModeTextButton[0], this.switchDiffMode.bind(this));
            this.createSwitchButton(themeSwitchButtonId, "Theme switch", this.switchTheme.bind(this));

            //disable ctrl+s action, since this is for most a reflection and it would trigger browser save page
            //an option would be to trigger dialog save
            this.CodeEditor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.KEY_S, function () { });

            this.SaveButton.set("isEnabled", false);
        },
    });

    return CodeEditorDialog;
});