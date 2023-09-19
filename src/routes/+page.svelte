<!-- App.svelte -->

<script>
    import {Parser} from '$lib/csv-parser.js';

    let jsonString = '';
    let fileName = '';
    const parser = new Parser();

    let isDragging = false;
    let isLoading = false;

    async function processFile(file) {
        isLoading = true;
        fileName = file.name;
        const reader = new FileReader();

        reader.onload = async function() {
            try {
                jsonString = JSON.stringify(parser.json(parser.parseFile(reader.result)), undefined, 2);
                isLoading = false;
            } catch (error) {
                jsonString = `Error parsing CSV: ${error}`;
                isLoading = false;
            }
        };

        reader.readAsText(file);
    }

    function fileInputChanged(event) {
        processFile(event.target.files[0]);
    }

    async function dragover(event){
        event.preventDefault();
        isDragging = true;
    }

    async function dragleave(){
        isDragging = false;
    }

    async function drop(event){
        event.preventDefault();
        isDragging = false;
        const file = event.dataTransfer.files[0];
        if(file){
            processFile(file);
        }
    }

    async function copyToClipboard(){
        try{
            await navigator.clipboard.writeText(jsonString);
            alert('JSON copied to clipboard!');
        }catch(err){
            alert('Failed to copy text: ' + err);
        }
    }
</script>

<svelte:head>
    <link rel="stylesheet" href="https://stackpath.bootstrapcdn.com/bootstrap/4.3.1/css/bootstrap.min.css">
</svelte:head>


<div class="container pt-5" role="button" tabindex="0" on:dragover="{dragover}" on:drop="{drop}" on:dragleave="{dragleave}">    <h1 class="text-center mb-4">CSV to JSON Converter</h1>
    <div class="input-group mb-3">
        <div class="input-group-prepend">
            <span class="input-group-text">Upload</span>
        </div>
        <div class="custom-file">
            {#if isLoading}
                <div class="spinner-border text-info" role="status">
                    <span class="sr-only">Loading...</span>
                </div>
            {:else}
                <input type="file" class="custom-file-input" id="csvFile" accept=".csv" on:change="{fileInputChanged}">
                <label class="custom-file-label" for="csvFile">{fileName || 'Choose a CSV file'}</label>
            {/if}
        </div>
    </div>
    <div class="card">
        <div class="card-header">
            <button class="btn disabled">JSON Output</button>
            <button class="btn btn-primary float-right" on:click={copyToClipboard}>Copy</button>
        </div>
        <div class="card-body">
            <pre>{jsonString}</pre>
        </div>
    </div>
</div>
