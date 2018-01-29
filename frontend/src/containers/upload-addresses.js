import React, { Component } from 'react';
import { apiBaseURL } from "./../config"

export class UploadAddresses extends Component {
    constructor(props) {
        super(props);
        this.state = {
            loading: false,
        }
        this.file = null;

    }

    componentDidMount() {
        this.dropEl = document.getElementById('drop');

        this.dropEl.addEventListener('dragenter', this.cancel);
        this.dropEl.addEventListener('dragover', this.cancel);
        this.dropEl.addEventListener('drop', this.handleDrop.bind(this));
    }

    cancel(e) {
        e.preventDefault();
        return false;
    }

    handleDrop(e) {
        e.preventDefault();

        this.setState({
            loading: true
        });

        const dt = e.dataTransfer;
        const files = dt.files;
        for (let i = 0; i < files.length; i++) {
            const file = files[i];
            const reader = new FileReader();
            reader.addEventListener('loadend', (e) => {
                fetch(apiBaseURL + "/requestUploadURL", {
                    method: "POST",
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        name: file.name.replace(/\s/g,''),
                        type: file.type
                    })
                })
                    .then((response) => {
                        return response.json();
                    })
                    .then((json) => {
                        return fetch(json.uploadURL, {
                            method: "PUT",
                            body: new Blob([reader.result], { type: file.type })
                        })
                    })
                    .then(() => {
                        console.log('https://kanto-addresses.s3.amazonaws.com/' + file.name);
                        this.setState({
                            loading: false
                        });
                    });
            });
            reader.readAsArrayBuffer(file);
        }
        return false;
    }

    render() {
        return (
            <div className="container">
                <div id="drop" className="alert alert-success">
                    <h3>Drop CSV here.</h3>
                    { this.state.loading ? "Loading" : null }
                </div>
            </div>
        );
    }
}

