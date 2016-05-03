import React from 'react';
import { Component } from 'react'
import { connect } from 'react-redux'
import FloatingActionButton from 'material-ui/FloatingActionButton'
import getMuiTheme from 'material-ui/styles/getMuiTheme';
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';

import { loadPagerData } from './actions/index'
import ClusteredTags from '../../../../dime-ui/src/components/clusteredTags'

export class App extends Component {
    componentWillMount() {
        console.log()
        this.props.loadPagerData(this.props.pageData)
    }
    render() {
        return (
            <div style={{position: 'fixed', top: 0, left: 0, zIndex: 9999999999999999999}}>
                <MuiThemeProvider muiTheme={getMuiTheme()}>
                    <FloatingActionButton>

                    </FloatingActionButton>
                </MuiThemeProvider>
            </div>
        );
    }
    componentDidMount() {
        console.log('hello ui')
    }
}

export default connect(null, { loadPagerData })(App)