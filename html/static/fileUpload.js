
/*
        Event when there is a new file added to upload.
*/
function newFileAdded()
{
        var input = document.getElementById('fileUpload');
        const curFiles = input.files;
        if (curFiles.length === 0) {
                alert("No files selected")
                return;
        }

        document.getElementById('fileStatus').innerHTML = "uploading " + curFiles.length + " file(s)";

        // Add files to list for the user to see.
        var table = document.getElementById('uploadList');
        table.innerHTML = "";
        for (var i = 0; i < curFiles.length; i++) {

                var row = table.insertRow(i);
                row.insertCell(0).innerHTML = curFiles[i].name;
                row.insertCell(1).innerHTML = getFileSize(curFiles[i].size);
                row.insertCell(2).innerHTML = getFileType(curFiles[i].name);
        }

        showModal();
}

/*
        Gets the file size.
*/
function getFileSize(size) {
        if (size < 1024) {
                return size + ' bytes';
        } else if (size >= 1024 && size < 1048576) {
                return (size/1024).toFixed(1) + ' KB';
        } else if (size >= 1048576) {
                return (size/1048576).toFixed(1) + ' MB';
        }
}


/*
        Gets the file type based on file extention.
        (It is not safe, but that doesn't matter in this case.)
*/
function getFileType(fileName) {
        
        if (fileName.includes('.txt'))
                return "ascii text";
        else if (fileName.includes('.exe'))
                return "windows PE file";
        else if (fileName.includes('.dll'))
                return "windows DLL file";
        else if (fileName.includes('.mp3'))
                return "mp3 music";
        else if (fileName.includes('.mp4'))
                return "mp4 video";
        else if (fileName.includes('.jpg') || fileName.includes('.jpeg'))
                return "jpeg picture";
        else if (fileName.includes(".png") || fileName.includes(".pneg"))
                return "png picture";
        else if (fileName.includes(".py") || fileName.includes(".pyc"))
                return "Python script";
        else if (fileName.includes(".js"))
                return "Javascript file";
        else if (fileName.includes(".html"))
                return "HTML file";
        else if (fileName.includes(".css"))
                return "CSS file";
        else if (fileName.includes("php"))
                return "PHP file";
        else if (fileName.includes(".cpp") || fileName.includes(".c"))
                return "C++/C code source file";
        else if (fileName.includes(".h") || fileName.includes(".hpp"))
                return "C++/C code header file";
        else 
                return "unknown/probably binary file";
}

/*
        Shows the modal of uploading the file.
*/
function showModal(fileList) {

        var modal = document.getElementById('modal');
        var closeBtn = document.getElementById('modal-close');

        modal.style.display = "block";
        
        closeBtn.onclick = function() {
                modal.style.display = "none";
        }

        window.onclick = function(event) {
                if (event.target == modal) {
                        modal.style.display = "none";
                }
        }
}

//https://developer.mozilla.org/en-US/docs/Web/HTML/Element/input/file