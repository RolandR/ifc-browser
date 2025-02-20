
const displayElement = document.getElementById("display");
const fileInput = document.getElementById("fileUpload");
const detailsOverlay = document.getElementById("detailsOverlay");
const detailsElement = document.getElementById("details");

let links = [];
let entities = [];

fileInput.onchange = function(e){
	e.preventDefault();
	
	const loadingStatus = document.getElementById("loadingStatus");
	const loadingContent = document.getElementById("loadingContent");
	const loadingBar = document.getElementById("loadingBar");
	
	loadingStatus.className = "";
	loadingBar.style.width = "0%";
	loadingStatus.style.display = "block";
	loadingContent.innerHTML = "Loading...<br>";
	
	const file = fileInput.files[0];
	
	const reader = new FileReader();
	
	reader.addEventListener("progress", function(e){
		let progress = ~~((e.loaded/e.total)*60);
		
		loadingBar.style.width = progress+"%";
	});
	
	reader.onload = function(){
		
		loadingContent.innerHTML += "<br>File uploaded, processing...";
		loadingBar.style.width = "60%";
		
		
		loadedString = reader.result;
		
		setTimeout(function(){processText(loadedString);}, 200);
	}
	
	setTimeout(function(){reader.readAsText(file);}, 100);
}

function processText(inputText){
	const lines = inputText.split('\n');
		
	let isData = false;
	
	for(let i in lines){
		
		if(isData){
			if(lines[i].trim().toLowerCase() == "endsec;"){
				isData = false;
			}
		}
		
		let line = lines[i];
		
		if(isData){
			let lineId = parseInt(line.substring(0, line.indexOf("=")).trim().replace("#", ""));
			let lineEntity = line.substring(line.indexOf("=")+1).trim();
			
			let entityName = lineEntity.substring(0, lineEntity.indexOf("(")).trim();
			entityName = findEntityName(entityName);
			
			let entityContent = lineEntity.substring(lineEntity.indexOf("(")).trim();
			
			entities[lineId] = {
				id: lineId,
				name: entityName,
				dependencies: [],
				dependants: [],
				content: entityContent
			};
			
			let lineDependencies = lineEntity.match(/#\d+/g);
			for(var d in lineDependencies){
				let dependency = parseInt(lineDependencies[d].trim().replace("#", ""));
				links.push([lineId, dependency]);
				entities[lineId].dependencies.push(dependency);
			}
			
			let lineEl = createLineElement(lineId);
			lineEl.id = lineId;
			displayElement.appendChild(lineEl);
		} else {
			let lineEl = document.createElement("p");
			lineEl.className = "line line-nodata";
			lineEl.innerHTML = line;
			displayElement.appendChild(lineEl);
		}
		
		if(!isData){
			if(lines[i].trim().toLowerCase() == "data;"){
				isData = true;
			}
		}
	}
	
	loadingContent.innerHTML += "<br>Updating dependencies...";
	loadingBar.style.width = "95%";
	
	updateDependants();
	
	loadingBar.style.width = "100%";
	loadingContent.innerHTML += "<br>Ready!";
	
	
	setTimeout(function(){
		loadingStatus.className = "fading";
		setTimeout(function(){
			loadingStatus.style.display = "none";
		}, 500);
	}, 100);
}

function showDetails(id, container){
	for(let i in entities[id].dependencies){
		let lineEl = createLineElement(entities[id].dependencies[i]);
		container.appendChild(lineEl);
		
	}
}

function createLineElement(entityId){
	let lineEl = document.createElement("p");
	let lineAnchor = '<a href="#'+entityId+'">#'+entityId+'</a>';
	let line = lineAnchor + '=<span class="entityName">' + entities[entityId].name +'</span>'+ entities[entityId].content;
	let lineContentEl = document.createElement("span");
	lineContentEl.innerHTML = line;
	let lineChildrenContainer = document.createElement("div");
	lineChildrenContainer.className = "entityChildren collapsed";
	
	let detailsButtonContainer = document.createElement("div");
	detailsButtonContainer.className = "detailsButtonContainer";
	if(entities[entityId].dependencies && entities[entityId].dependencies.length > 0){
		//detailsButtonContainer += '<button id="details'+entityId+'" onclick="showDetails('+entityId+');">+</button>';
		let detailsButton = document.createElement("button");
		detailsButton.innerHTML = "▼";
		detailsButton.className = "initial";
		detailsButtonContainer.appendChild(detailsButton);
		detailsButton.onclick = function(e){
			if(e.target.className == "initial"){
				let containerLineEl = e.target.parentElement.parentElement.getElementsByClassName("entityChildren")[0];
				showDetails(entityId, containerLineEl);
				containerLineEl.className = "entityChildren expanded";
				detailsButton.className = "expanded";
				detailsButton.innerHTML = "▲";
				
			} else if(e.target.className == "collapsed") {
				let containerLineEl = e.target.parentElement.parentElement.getElementsByClassName("entityChildren")[0];
				containerLineEl.className = "entityChildren expanded";
				detailsButton.className = "expanded";
				detailsButton.innerHTML = "▲";
				
			} else if(e.target.className == "expanded") {
				let containerLineEl = e.target.parentElement.parentElement.getElementsByClassName("entityChildren")[0];
				containerLineEl.className = "entityChildren collapsed";
				detailsButton.className = "collapsed";
				detailsButton.innerHTML = "▼";
				
			}
		};
	}
	
	lineEl.appendChild(detailsButtonContainer);
	lineEl.appendChild(lineContentEl);
	lineEl.appendChild(lineChildrenContainer);
	lineEl.className = "line line-data";
	
	return lineEl;
}

function findEntityName(entityName){
	let replacedEntityName = ifcKeywords.find((element) => element.toLowerCase() == entityName.toLowerCase());
	if(replacedEntityName){
		entityName = replacedEntityName;
	}
	return entityName;
}

function listDependencies(id, depth){
	if(!depth){
		depth = 0;
	}
	let outString = "    ".repeat(depth);
	outString += entities[id].name + " #" + id;
	console.log(outString);
	for(let i in entities[id].dependencies){
		listDependencies(entities[id].dependencies[i], depth+1);
	}
}

function listDependants(id, depth){
	if(!depth){
		depth = 0;
	}
	let outString = "    ".repeat(depth);
	outString += entities[id].name + " #" + id;
	console.log(outString);
	for(let i in entities[id].dependants){
		listDependants(entities[id].dependants[i], depth+1);
	}
}

function updateDependants(){
	for(let i in links){
		entities[links[i][1]].dependants.push(links[i][0]);
	}
}