import { Editor, Monaco } from '@monaco-editor/react';
import { editor } from 'monaco-editor';
import { useRef } from 'react';
import parser from 'prettier/parser-babel'

import * as prettier from 'prettier'
import { BundledLanguage, BundledTheme, createHighlighter, HighlighterGeneric } from "shiki";
import { shikiToMonaco } from "@shikijs/monaco";


export interface CodeEditorProps{
    initialValue:string,

    onChange:(value: string | undefined, ev: editor.IModelContentChangedEvent)=>void;
}

const CodeEditor = ({onChange,initialValue}:CodeEditorProps) => {

    const editorRef = useRef<editor.IStandaloneCodeEditor | null>(null);

    const handleEditorDidMount=async (editor: editor.IStandaloneCodeEditor, monaco: Monaco)=>  {

        // monaco?.languages.typescript.javascriptDefaults.setEagerModelSync(true);

        // monaco.languages.typescript.javascriptDefaults.setDiagnosticsOptions({
        //     noSemanticValidation: true,
        //     noSyntaxValidation: false,
        // });

        // monaco.languages.typescript.javascriptDefaults.setCompilerOptions({
        //     target: monaco.languages.typescript.ScriptTarget.ES2016,
        //     allowNonTsExtensions: true,
        //     allowJs: true,
        //     moduleResolution:
        //         monaco.languages.typescript.ModuleResolutionKind.NodeJs,
        //     module: monaco.languages.typescript.ModuleKind.ESNext,
        // });

        monaco.languages.register({id:'javascript'});
        

        editorRef.current = editor;
       
    }

    const getEditorValue=()=> {
        return (editorRef.current?.getValue()) || '';
    }

    const onBeforeMount=async(monaco:Monaco)=>{
        // Create the highlighter, it can be reused

        monaco.languages.register({ id: "javascript" });

        monaco.editor.setTheme("vitesse-dark");

        
        const highlighter = await createHighlighter({
            themes: ['vitesse-dark'],
            langs: ["javascript"],
            // Register the themes from Shiki, and provide syntax highlighting for Monaco.
        });

        shikiToMonaco(highlighter,monaco)

    }

    const onFormatClick=async()=>{
        const unformatted=getEditorValue();

        console.log(parser);
        const formatted = await prettier.format(unformatted,{
            parser: 'babel',
            plugins: [{languages:[{name:'javascript',parsers:['babel']}],parsers:{
                'babel':parser.parsers.babel
            }}],
            semi: true,
        });

        editorRef.current?.setValue(formatted)
        
    }

    return (
        <div>
            <button onClick={onFormatClick}>Format</button>
            <Editor
                height="30vh"
                defaultValue={initialValue}
                defaultLanguage="javascript"
                theme="vs-dark"
                options={{
                    wordWrap: "on",
                    showUnused: false,
                    automaticLayout: true,
                }}
                onMount={handleEditorDidMount}
                
                onChange={onChange}
            />
        </div>
    );
}

export default CodeEditor
