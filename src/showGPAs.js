var gpaRangeColors = {//if gpa is >= this number, set as this color
	3.0: "#2ecc71",//green
	2.5: "#e67e22",//orange
	2.0: "#f1c40f",//yellow
	0: "#e74c3c",//red
}


if(document.getElementsByClassName('datadisplaytable')){

	var tbodyMain = document.getElementsByClassName('datadisplaytable')[0].childNodes[2]

	var firstRowMain = tbodyMain.childNodes[4]

	var subject = firstRowMain.childNodes[2*2 + 1]
	var number = firstRowMain.childNodes[3*2 + 1]

	var courseName = subject.textContent + number.textContent

	

	loadPage(courseName)

	function getGpaColor(gpa){
		var sortedGpaKeys = Object.keys(gpaRangeColors).sort(function(a, b){return parseFloat(b) - parseFloat(a)})

		for(var i = 0; i < sortedGpaKeys.length; i++){
			var minGpa = parseFloat(sortedGpaKeys[i])
			if(gpa >= minGpa)
				return gpaRangeColors[minGpa]
		}

		return "#000"
	}

	//https://oscar.gatech.edu/pls/bprod/bwskfcls.P_GetCrse

	function addGPA(gpaMap){

		if(!document.getElementsByClassName('datadisplaytable'))
			return

		var tbody = document.getElementsByClassName('datadisplaytable')[0].childNodes[2]

		for(var i = 2*2; i < tbody.childNodes.length; i+=2){

			var teacherColumn = tbody.childNodes[i].childNodes[17*2 + 1]
			var rawTeacherName = teacherColumn.childNodes[0].nodeValue
			
			
			var teacherName = cleanTeacherName(rawTeacherName)

			teacherColumn.innerHTML += (gpaMap[teacherName]) ? " " + gpaToHTML(gpaMap[teacherName]) : ""
		}
	}


	function loadPage(courseName){
		httpGetAsync("https://critique.gatech.edu/course.php?id=" + courseName,function(res){

			var parser = new DOMParser()

			var psuedoDoc = parser.parseFromString(res, "text/html")


			var tbody = psuedoDoc.getElementById('dataTable').childNodes[3]

			var gpaMap = {}

			for(var i = 1; i < tbody.childNodes.length; i+=2){
				
				var tr = tbody.childNodes[i]
				
				var rawTeacherName = tr.childNodes[1].childNodes[0].textContent

				var teacherName = cleanTeacherName(rawTeacherName)

				var gpa = parseFloat(tr.childNodes[2*2+1].childNodes[0].textContent)


				gpaMap[teacherName] = gpa


			}


			addGPA(gpaMap)

			
		})
	}


	function httpGetAsync(theUrl, callback){//async code from http://stackoverflow.com/questions/247483/http-get-request-in-javascript
	    var xmlHttp = new XMLHttpRequest();
	    xmlHttp.onreadystatechange = function() { 
	        if (xmlHttp.readyState == 4 && xmlHttp.status == 200)
	            callback(xmlHttp.responseText);
	    }
	    xmlHttp.open("GET", theUrl, true); // true for asynchronous 
	    xmlHttp.send(null);
	}


	function cleanTeacherName(rawTeacherName){
		return rawTeacherName.replace(/\,.*/gi,"").toUpperCase()
	}

	function emphasize(color, text){
		return "<b style='color: " + color + "'>" + text + "</b>"
	}

	function gpaToHTML(gpa){
		return emphasize(getGpaColor(gpa), gpa)
	}

}
		
