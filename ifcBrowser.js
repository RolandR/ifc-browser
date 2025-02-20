
const displayElement = document.getElementById("display");
const fileInput = document.getElementById("fileUpload");
const detailsOverlay = document.getElementById("detailsOverlay");
const detailsElement = document.getElementById("details");

let data = [];
let links = [];
let entities = [];

fileInput.onchange = function(e){
	e.preventDefault();
	
	const file = fileInput.files[0];
	
	const reader = new FileReader();
	
	console.log("blob");
	
	reader.onload = function(){
		loadedString = reader.result;
		
		const lines = loadedString.split('\n');
		
		let isData = false;
		
		for(let i in lines){
			if(isData){
				if(lines[i].trim().toLowerCase() == "endsec;"){
					isData = false;
				}
			}
			
			let line = lines[i];
			
			if(isData){
				let lineParts = line.split("=");
				let lineId = parseInt(lineParts[0].trim().replace("#", ""));
				let lineEntity = lineParts[1];
				
				let entityName = lineEntity.substring(0, lineEntity.indexOf("(")).trim();
				entityName = findEntityName(entityName);
				
				entities[lineId] = {
					id: lineId,
					name: entityName,
					dependencies: [],
					dependants: []
				};
				
				let lineDependencies = lineParts[1].match(/#\d+/g);
				for(var d in lineDependencies){
					let dependency = parseInt(lineDependencies[d].trim().replace("#", ""));
					links.push([lineId, dependency]);
					entities[lineId].dependencies.push(dependency);
				}
				
				data[lineId] = lineParts[1];
				
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
		
		
		updateDependants();
	}
	
	setTimeout(function(){reader.readAsText(file);}, 100);
}

/*function showDetails(id){
	detailsOverlay.className = "visible";
	
	let entity = data[id];
	
	let entityName = entity.substring(0, entity.indexOf("(")).trim();
	entityName = findEntityName(entityName);
	
	let parenContents = entity.substring(entity.indexOf("(")+1, entity.lastIndexOf(")"));
	parenContents = parenContents.replace(/,/g, ",<br>");
	
	
	detailsElement.innerHTML = '<h2>#'+id+'</h2>'+entityName+'(<br><div class="parenContents">'+parenContents+'</div>)';
}*/

function showDetails(id, container){
	for(let i in entities[id].dependencies){
		let lineEl = createLineElement(entities[id].dependencies[i]);
		container.appendChild(lineEl);
		
	}
}

function createLineElement(entityId){
	let lineEl = document.createElement("p");
	let lineAnchor = '<a href="#'+entityId+'">#'+entityId+'</a>';
	let line = lineAnchor + "=" + entities[entityId].name;
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