import React, { Component } from 'react';
import logo from './logo.svg';
import './App.css';

import { UploadAddresses } from './containers/upload-addresses';
import { ListAddresses } from './containers/list-addresses';

class App extends Component {
  render() {
    return (
      <div className="container">
       <UploadAddresses />
       <ListAddresses />
      </div>
    );
  }
}

export default App;
