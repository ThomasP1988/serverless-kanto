import React, { Component } from 'react';
import { apiBaseURL } from "./../config"
import ReactJson from 'react-json-view'

export class ListAddresses extends Component {

    constructor(props) {
        super(props);
        this.state = {
            loading: true,
            data: null,
            searchByRegion: ''
        }
        this.fetchData();
        this.handleChange = this.handleChange.bind(this);
    }

    handleChange(event) {
        this.setState({searchByRegion: event.target.value});
      }

    fetchData() {
        let query = null;
        if (!this.state.loading) {
            this.setState({
                loading: true
            });
        }
        if (this.state.searchByRegion && this.state.searchByRegion.length > 0) {
            const params = {
                region: this.state.searchByRegion
            }

            const esc = encodeURIComponent;
            query = Object.keys(params)
                .map(k => esc(k) + '=' + esc(params[k]))
                .join('&');
        }
        console.log(query);
        
       
        fetch(apiBaseURL + "/addresses" + (query ?  "?" + query : ""), {
            method: "GET",
            headers: {
                'Content-Type': 'application/json'
            }
            })
            .then((response) => {
                return response.json();
            }).then((response) => {
                console.log("response", response);
                this.setState({
                    loading: false,
                    data: response
                });
            });
    }
  

    render() {
        return (
            <div className="container">
                <div className="input-group">
                <input type="text" className="form-control" placeholder="search by region" value={this.state.searchByRegion} onChange={this.handleChange} aria-label="Recipient's username" aria-describedby="basic-addon2" />
                <div className="input-group-append">
                  <button className="btn btn-outline-secondary" type="button" onClick={this.fetchData.bind(this)}>Search</button>
                  <button className="btn btn-outline-secondary" type="button" onClick={this.fetchData.bind(this)}>Refresh</button>
                </div>
              </div>
                <div className="list-container">
                { this.state.loading ?  "Loading" : <ReactJson src={this.state.data} />}
                </div>
            </div>
        );
    }
}

