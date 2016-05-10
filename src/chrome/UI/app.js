import React from 'react';
import { Component } from 'react'
import { connect } from 'react-redux'
import FloatingActionButton from 'material-ui/FloatingActionButton'
import getMuiTheme from 'material-ui/styles/getMuiTheme';
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
import MediumEditor from 'medium-editor'
//import "../../../node_modules/bootstrap/dist/css/bootstrap.min.css"

//import "./css/editor.css"
import { loadPagerData } from './actions/index'
import ClusteredTags from './components/clusteredTags'

const blur = {
    width: '100%',
    position: 'absolute',
    top: '0',
    left: '0',
    zIndex: 99998,
    WebkitFilter: 'blur(6px) grayscale(100%)',
    MozFilter: 'blur(6px) grayscale(100%)',
    OFilter: 'blur(6px) grayscale(100%)',
    MsFilter: 'blur(6px) grayscale(100%)',
    filter: 'blur(6px) grayscale(100%)',
    backgroundColor: 'white',
    opacity: '1'
}

export class App extends Component {
    componentWillMount() {
        //console.log(this.props.pageData)
        this.props.loadPagerData(this.props.pageData)
    }
    renderBlurBackground() {
        return (
            <div style={blur}>
                {this.renderFakePage(document.body.innerHTML)}
            </div>
        )
    }
    render() {
        return (
            <div>
                {this.renderBlurBackground()}
                <div style={{
                         width: '80%',
                         position: 'absolute',
                         top: '5%',
                         left: '10%',
                         zIndex: 99999,
                         backgroundColor: 'white',
                         //transform: 'scale(0.92,0.92)',
                         }}
                     className='shadow'
                >
                    {this.renderFakePage(this.props.pageData.HTML)}
                </div>
            </div>

        );
    }
    renderFakePage(html) {
        return (
            <div style={{
                    backgroundColor: 'white',
                    padding: '50px',
                    border: '2px solid rgba(0,0,0,.1)'
                    }}
                 dangerouslySetInnerHTML={{__html: html}}>

            </div>
        )
    }
    renderTexts() {
        return (
            <div>
                {this.props.pageData.pageTexts.map((text, index)=> {
                    if (text.length && text.length > 10) {
                        return (<span style={{fontSize: '12px', lineHeight: '0.75'}}key={index}> {text} </span>)
                    }
                })}
            </div>

        )
    }
    renderCluster(tags) {
        return (
            <div style={{width: '40%', height: '10%', zIndex: 100000, position: 'absolute',
    top: '0',
    left: '300',}}>
                <ClusteredTags tags={tags} />
            </div>
        )
    }
    componentDidMount() {
        //console.log('hello ui')
    }
}

export default connect(null, { loadPagerData })(App)