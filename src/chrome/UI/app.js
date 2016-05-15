import React from 'react';
import { Component } from 'react'
//import { connect } from 'react-redux'
//import FloatingActionButton from 'material-ui/FloatingActionButton'
//import getMuiTheme from 'material-ui/styles/getMuiTheme';
//import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
import MediumEditor from 'medium-editor'
import { Button, Card } from 'belle'
import MdEdit from 'react-icons/lib/md/edit'
import MdClose from 'react-icons/lib/md/close'
import MdSend from 'react-icons/lib/md/send'
import MdNoteAdd from 'react-icons/lib/md/note-add'
//import "../../../node_modules/bootstrap/dist/css/bootstrap.min.css"

import 'medium-editor/dist/css/medium-editor.min.css'
import 'medium-editor/dist/css/themes/default.min.css'
import "./css/editor.css"

//import { loadPageData } from './actions/index'
//import ClusteredTags from './components/clusteredTags'
import getTextTokens from '../getTextTokens'

const blur = {
    width: '100%',
    position: 'absolute',
    top: '0px',
    left: '0px',
    zIndex: 99998,
    WebkitFilter: 'blur(6px) grayscale(100%)',
    MozFilter: 'blur(6px) grayscale(100%)',
    OFilter: 'blur(6px) grayscale(100%)',
    MsFilter: 'blur(6px) grayscale(100%)',
    filter: 'blur(6px) grayscale(100%)',
    backgroundColor: 'white',
    opacity: '1'
}
//from http://stackoverflow.com/questions/10730309/find-all-text-nodes-in-html-page
function textNodesUnder(el){
    let n, a = [], walk = document.createTreeWalker(el,NodeFilter.SHOW_TEXT,null,false);
    while(n = walk.nextNode()) {
        if (n.parentElement) {
            a.push(n.parentElement)
        }
    }
    return a
}

class App extends Component {
    constructor(props) {
        super(props)
        this.state = {
            editorOpen: false,
            textTokens: []
        }
        this.handleTagButtonClick = this.handleTagButtonClick.bind(this)
        this.handleTokenize = this.handleTokenize.bind(this)
        this.handleEditClick = this.handleEditClick.bind(this)
    }
    componentWillMount() {
        //console.log(this.props.pageData)
        //this.props.loadPageData(this.props.pageData)
    }
    handleTagButtonClick() {
        this.setState({editorOpen: !this.state.editorOpen})
    }
    handleTokenize() {
        var text = "";
        if (window.getSelection) {
            text = window.getSelection().toString();
        } else if (document.selection && document.selection.type != "Control") {
            text = document.selection.createRange().text;
        }
        this.setState({textTokens: getTextTokens(text)})
        //return getTextTokens(text)
    }
    handleEditClick() {
        let textNodes =  textNodesUnder(document.querySelector(".textContentToBeTagged"))
        let handleTokenize = this.handleTokenize
        new MediumEditor(textNodes, {
            disableEditing: true,
            toolbar: {
                buttons: [
                    {
                        name: 'h1', //name of the button being overridden
                        action: handleTokenize,
                        aria: 'tokenize selection',
                        tagNames: ['TOKENIZE'],
                        contentDefault: '<b>Tokenize Selected Text</b>'
                    }
                ]
            }
        })
    }
    render() {
        return (
            <div>
                {this.state.editorOpen ? null:
                    <Button primary
                            onClick={this.handleTagButtonClick}
                            style={{
                                     position: 'fixed',
                                     bottom: '7%',
                                     right: '3%',
                                     zIndex: 100000,
                                }}
                    >
                        <MdNoteAdd />
                    </Button>
                }
                <div style={{
                     position: 'fixed',
                     top: '5vh',
                     left: '10%',
                     zIndex: 99999,
                     width: '80%',
                     backgroundColor: 'white',
                     //transform: 'scale(0.92,0.92)',
                     }}
                     className='shadow'
                >
                    <div
                        className="dimeTaggingPanel"
                    >
                    </div>
                    {this.state.editorOpen ? this.renderRead(this.props.pageData.HTML, this.props.pageData.tags): null}
                </div>
            </div>

        );
    }
    renderRead(html, tags) {
        return (
            <div>
                <Button
                    primary
                    onClick={this.handleEditClick}
                    style={{
                            position: 'absolute',
                            top: '3px',
                            left: '3px',
                            zIndex: 100000,
                    }}
                >
                    <MdEdit />
                </Button>
                <Button
                    primary
                    onClick={this.handleSendButtonClick}
                    style={{
                         position: 'absolute',
                         top: '3px',
                         left: '55px',
                         zIndex: 100000,
                         borderBottom: '1px solid #3cb675',
                         background: '#45ec91'
                    }}
                >
                    <MdSend />
                </Button>
                <div
                    style={{
                             position: 'absolute',
                             top: '3px',
                             left: '120px',
                             zIndex: 100000,
                        }}
                >
                    {tags.map((tag ,index)=> {
                        return (
                            <div
                                key={index}
                                style={{
                                    display:'inline-block',
                                    marginRight: '15px',
                                    borderTop: '1px solid rgba(0,0,0,.01)',
                                    borderLeft: '1px solid rgba(0,0,0,.06)',
                                    borderRight: '1px solid rgba(0,0,0,.06)',
                                    borderBottom: '1px solid rgba(0,0,0,.1)',
                                    padding: '5px',
                                    fontSize: '10px',
                                    background: 'rgba(252,252,252,.95)'
                                }}
                            >
                                {tag.text}
                            </div>
                        )
                    })}
                </div>
                <div
                    style={{
                             position: 'absolute',
                             top: '28px',
                             left: '120px',
                             zIndex: 100000,
                             width: '80%'
                        }}
                >
                    {this.state.textTokens.map((token ,index)=> {
                        return (
                            <div
                                key={index}
                                style={{
                                    display:'inline-block',
                                    marginRight: '5px',
                                    marginTop: '3px',
                                    borderTop: '1px solid rgba(0,0,0,.01)',
                                    borderLeft: '1px solid rgba(0,0,0,.06)',
                                    borderRight: '1px solid rgba(0,0,0,.06)',
                                    borderBottom: '1px solid rgba(0,0,0,.1)',
                                    padding: '5px',
                                    fontSize: '10px',
                                    background: 'rgba(255, 255, 0, .65)'
                                }}
                            >
                                {token}
                            </div>
                        )
                    })}
                </div>
                <Button
                    onClick={this.handleTagButtonClick}
                    style={{
                             position: 'absolute',
                             top: '3px',
                             right: '18px',
                             zIndex: 100000,
                        }}
                >
                    <MdClose />
                </Button>
                <div style={{
                        backgroundColor: 'white',
                        padding: '50px',
                        border: '2px solid rgba(0,0,0,.1)',
                        maxHeight: '75vh',
                        overflowY: 'scroll'
                        }}
                     className='textContentToBeTagged'
                     dangerouslySetInnerHTML={{__html: html}}>
                </div>
            </div>
        )
    }
    renderBlurBackground() {
        return (
            <div style={blur}>
                <div
                    dangerouslySetInnerHTML={{__html: document.body.innerHTML}}
                >
                </div>
            </div>
        )
    }
    renderCluster(tags) {
        return (
            <div style={{width: '40%', height: '10%'}}>
                <ClusteredTags tags={tags} />
            </div>
        )
    }
    componentDidMount() {

    }
}

export default App