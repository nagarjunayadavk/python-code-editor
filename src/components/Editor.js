import React, { Component, Fragment } from 'react';
import Sk from 'skulpt';
import CodeMirror from 'codemirror';
import 'codemirror/mode/meta';
import 'codemirror/mode/python/python';
import 'codemirror/mode/javascript/javascript';
import './monokai.css';

const defaultOptions = {
    tabSize: 2,
    autoCloseBrackets: true,
    matchBrackets: true,
    showCursorWhenSelecting: true,
    lineNumbers: true,
    fullScreen: true,
    theme: "monokai",
    mode: 'python',
    styleActiveLine: true
}

const defaultValuesConfig = {
    python: '# Write Code Here \nprint("Hello World")',
    javascript: '// Write Code Here \nconsole.log("Hello World")'
}

class Editor extends Component {
    constructor(props) {
        super(props);
        this.state = {
            textAreaValue: "",
            language: 'python',
            output: null,
            error: null
        };
    }

    componentDidMount() {
        //set Deafult value 
        this.setState({ textAreaValue: defaultValuesConfig['python'] });
        let editor = document.getElementById("yourcode");
        let codeMirror = new CodeMirror.fromTextArea(editor, defaultOptions);
        codeMirror.setValue(defaultValuesConfig[this.state.language])
        codeMirror.on('change', editor => {
            // console.log(editor.getValue());
            this.setState({ textAreaValue: editor.getValue() })
        });
        this.setState({
            editor: codeMirror
        });
    }

    outf = (text) => {
        this.setState({ output: text });
    }
    builtinRead = (x) => {
        if (Sk.builtinFiles === undefined || Sk.builtinFiles["files"][x] === undefined)
            throw "File not found: '" + x + "'";
        return Sk.builtinFiles["files"][x];
    }

    onCodeSubmit = () => {
        if (this.state.language === 'python') {
            this.pythonCodeRun();
        } else if (this.state.language === 'javascript') {
            this.jsCodeRun();
        }
    }

    jsCodeRun = () => {
        // write code here
    }

    pythonCodeRun = () => {
        // var prog = document.getElementById("yourcode").value;
        var prog = this.state.textAreaValue;
        var mypre = document.getElementById("output");
        mypre.innerHTML = '';
        Sk.pre = "output";
        Sk.configure({
            output: this.outf,
            read: this.builtinRead,
            __future__: Sk.python3
        });
        (Sk.TurtleGraphics || (Sk.TurtleGraphics = {})).target = 'mycanvas';
        var myPromise = Sk.misceval.asyncToPromise(function () {
            return Sk.importMainWithBody("<stdin>", false, prog, true);
        });
        let state = this;
        myPromise.then(function (mod) {
            console.log('success');
        },
            function (err) {
                console.log(err.toString());
                state.setState({ error: err })
            });
    }

    handleChange = (event) => {
        this.setState({ textAreaValue: event.target.value });
    }

    changeLanguage = (event) => {
        const language = event.target.value;
        this.setState({ language: language });
        this.setState({ textAreaValue: defaultValuesConfig[language] });
        defaultOptions['mode'] = language;
        this.state.editor.setOption('mode', language);
        this.state.editor.setValue(defaultValuesConfig[language]);
        this.clearOutput();
    }

    clearOutput = () => {
        if (this.state.output) this.setState({ output: null })
        if (this.state.error) this.setState({ error: null })
    }

    render() {
        return (
            <Fragment>
                <h3>Try This</h3>

                <div className="form-group row">
                    <label htmlFor="lang" className="col-sm-3 col-md-2 col-form-label"> Select Language</label>
                    <select id="lang" onChange={this.changeLanguage} value={this.state.language} className="col-sm-9 col-md-8 custom-select">
                        <option value="python"> Python </option>
                        <option value="javascript"> JavaScript </option>
                    </select>
                </div>

                <div className="container">
                    <div className="row">
                        <div className="col-xs-6 col-md-6 border">
                            <textarea id="yourcode"
                                value={this.state.textAreaValue}
                                cols="40" rows="10"
                                onChange={this.handleChange}></textarea>
                        </div>
                        <div className="col-xs-1 col-md-1 border-0">

                        </div>
                        <div className="col-xs-5 col-md-5 border">
                            <pre id="output" >
                                {this.state.output ? this.state.output : ''}
                            </pre>
                            <div id="mycanvas"></div>
                            <div id="errorDetails" className={"alert alert-danger" + (this.state.error ? "" : "none")} style={{}}>
                                {this.state.error ? this.state.error.toString() : ''}
                            </div>
                        </div>
                    </div>
                </div>
                <div className="mt-2">
                    <button type="button" onClick={this.onCodeSubmit} className="btn btn-primary">Run</button>
                    <button type="button" onClick={this.clearOutput} className="btn btn-warning ml-2">Clear</button>
                </div>

                {/* <textarea> */}
            </Fragment>
        );
    }
}

export default Editor;