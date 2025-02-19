
const displayElement = document.getElementById("display");
const fileInput = document.getElementById("fileUpload");
const detailsOverlay = document.getElementById("detailsOverlay");
const detailsElement = document.getElementById("details");

let data = [];

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
			
			let lineEl = document.createElement("p");
			let line = lines[i];
			
			if(isData){
				let lineParts = line.split("=");
				let lineId = lineParts[0].trim().replace("#", "");
				let lineAnchor = '<a href="#'+lineId+'">#'+lineId+'</a>';
				let lineEntity = lineParts[1];
				
				lineEl.id = lineId;
				lineEntity = lineEntity.replace(/#\d+/g, function(match){return '<a href="'+match+'">'+match+'</a>';});
				line = lineAnchor + "=" + lineEntity;
				data[lineId] = lineParts[1];
				
				let detailsButton = '<div class="detailsButtonContainer"><button id="details'+lineId+'" onclick="showDetails('+lineId+');">+</button></div>';
				
				lineEl.className = "line line-data";
				lineEl.innerHTML = detailsButton+line;
				displayElement.appendChild(lineEl);
			} else {
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
		
		
		//displayElement.innerHTML = loadedString;
	}
	
	setTimeout(function(){reader.readAsText(file);}, 100);
}

function showDetails(id){
	detailsOverlay.className = "visible";
	
	let entity = data[id];
	
	let entityName = entity.substring(0, entity.indexOf("(")).trim();
	entityName = findEntityName(entityName);
	
	let parenContents = entity.substring(entity.indexOf("(")+1, entity.lastIndexOf(")"));
	parenContents = parenContents.replace(/,/g, ",<br>");
	
	
	detailsElement.innerHTML = '<h2>#'+id+'</h2>'+entityName+'(<br><div class="parenContents">'+parenContents+'</div>)';
}

function findEntityName(entityName){
	let replacedEntityName = ifcKeywords.find((element) => element.toLowerCase() == entityName.toLowerCase());
	if(replacedEntityName){
		entityName = replacedEntityName;
	}
	return entityName;
}