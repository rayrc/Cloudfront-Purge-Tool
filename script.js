
window.pendinginvalidations = [];

var errormessages = {
  MalformedInput: "Please enter something in the box and submit again.",
  InvalidArgument: "The path must start with a / and special characters (e.g. comma or space) must be urlencoded. Please correct and try again.",
  SignatureDoesNotMatch: "Please check your Secret and try again."
}

var getErrorMsg = function(error){
  if (errormessages[error.code] != undefined){
    return errormessages[error.code];
  } else {
    return error.message;
  }
}

var croncheck = function(){
  // checks pengind invalidations every minute
  var cb = function(res){
    console.log(res);
    if(res.Invalidation.Status["#text"] == "Completed"){
      var id = res.Invalidation.Id["#text"];
      var index = searchobjlist(pendinginvalidations, id);
      //show notification
      var notification = webkitNotifications.createNotification(
        'icon.png',  // icon url - can be relative
        'Purge Completed!' ,  // notification title
        'ID: ' + id // notification body text
      );
      notification.show();
      //refresh current invals.. just in case
      cfobj.getAllInvalidations(currentdist, updateinvalidations);
      //delete
      if (index != -1){
        pendinginvalidations.splice(index, 1);
      }
    }
  }
  for(i=0;i<pendinginvalidations.length;i++){
    cfobj.getInvalidationDetails(pendinginvalidations[i].distid, pendinginvalidations[i].id, cb);
  }
  setTimeout(croncheck, 10000);
}

var distributionclickhandler = function(distid){
  if (typeof(distid) == "string"){
    var id = distid;
  } else {
    var id = this.getElementsByClassName("id")[0].innerHTML;
  }
  console.log(id);
  window.currentdist = id;
  cfobj.getAllInvalidations(id, updateinvalidations);
}

var invaldetails = function(){
  var id = this.getElementsByClassName("id")[0].innerHTML;
  $( "#invaldetails" )[0].innerHTML = "Loading..."
  cfobj.getInvalidationDetails(currentdist, id);
}

var placepurgereq = function(box){
  var invalspinner = document.getElementById("invalspinner"),
      invalerror = document.getElementById("invalerror"),
      flist = document.getElementById("csvpathlist").value;

  invalspinner.style.display = "block";
  invalerror.style.display = "none";
  invalerror.innerHTML = "";
  
  console.log(flist);
  console.log(currentdist);
  
  var errorhandler = function(error){
    invalspinner.style.display = "none";
    invalerror.style.display = "block";
    invalerror.innerHTML = getErrorMsg(error);
  }
  cfobj.AddNewPurgeRequest(currentdist, flist, function(res){
    invalspinner.style.display = "none";
    console.log(res);
    document.getElementById("csvpathlist").value = "";
	_gaq.push(["_trackEvent","Tools","CF Purge Tool","New purge request",,!0])
    distributionclickhandler(currentdist);
  }, errorhandler );
}

var updateinvaldetails = function(obj){
  //invaldetails
  console.log(obj);
  var id = obj.Invalidation.Id["#text"];
  var created = obj.Invalidation.CreateTime["#text"];
  var status = obj.Invalidation.Status["#text"];
  var rawpaths = obj.Invalidation.InvalidationBatch.Path;
  var paths = "";
  if (rawpaths.length == undefined){
    paths = rawpaths["#text"];
  } else {
    var patharr = [];
    for (i=0;i<rawpaths.length;i++){
      patharr.push(rawpaths[i]["#text"])
    }
    paths = patharr.join(",")
  }
  if (status == "InProgress"){
    status = "In progress";
  }
  var inval = $("#invaldetails")[0];
  inval.innerHTML = '<h3 class="ui-widget-header ui-corner-all">Purge Details</h3>Id: ' + id + "<br>Created : " + created + "<br>Files: " + paths + " <br>Status: " + status
  $( "#invaldetails" ).effect( "slide", {}, 500 );
  _gaq.push(["_trackEvent","Tools","CF Purge Tool","View purge details",,!0])
}


var updatedistlist = function(dist){
  console.log(dist);
  var distributions = document.getElementById("distributions");
  var ol = document.createElement('ul');
  ol.id = "distlist";
  for (i=0;i<dist.length;i++){
    var box = document.createElement('li');
    box.className = "distbox";
    box.classList.add("ui-widget-content");
    var el = document.createElement('div');
    el.className = "id";
    /*el.innerHTML += "id: ";*/
    el.appendChild(document.createTextNode(dist[i].Id["#text"]));
    var cname = document.createElement('div');
    /*cname.className = "cnames";
    cname.innerHTML += "CNAMES: <br>";*/

    var cn = document.createElement('div');
    cn.className = "cname";
    cn.appendChild(document.createTextNode(dist[i].DomainName["#text"]));
    cname.appendChild(cn);        

    var cnames = dist[i].CNAME;
    if (cnames != undefined){
      if (cnames["#text"] != undefined){
        var cn = document.createElement('div');
        cn.className = "cname";
        cn.appendChild(document.createTextNode(cnames["#text"]));
        cname.appendChild(cn);        
      } else {
        for(j=0;j<cnames.length;j++){
          var cn = document.createElement('div');
          cn.className = "cname";
          cn.appendChild(document.createTextNode(cnames[j]["#text"]));
          cname.appendChild(cn);
        }        
      }
    }
    console.log(cname);
    box.appendChild(el);
    box.appendChild(cname);
//    box.onclick = distributionclickhandler;
    ol.appendChild(box);
    distributions.appendChild(ol);
  }
  distributions.style.display="";
  $( "#distlist" ).selectable();
  $( "#distlist" ).bind( "selectableselected", function(event, ui) {
    document.getElementById("invaldetails").innerHTML = "";
    document.getElementById("invaldetails").style.display = "block";

    id = ui.selected.getElementsByClassName("id")[0].innerHTML;
    window.currentdist = id;
    cfobj.getAllInvalidations(id, updateinvalidations);
    document.getElementById("invalidations").innerHTML = '<span id="invallistspinner" ><img src="spinner-16x16.gif" width="16" height="16">Loading your last purge requests ...</span>';    
  });

}

var updateinvalidations = function(invals){
  console.log(invals);
  var invalidations = document.getElementById("invalidations");
  invalidations.style.display = "block";
  //remove all childrens if exists
  if ( invalidations.hasChildNodes() ){
    while ( invalidations.childNodes.length >= 1 ){
      invalidations.removeChild( invalidations.firstChild );       
    } 
  }
  //<h3 class="ui-widget-header ui-corner-all">Invalidations</h3>
  title = document.createElement('h3');
  title.className = "ui-widget-header ui-corner-all";
  title.appendChild(document.createTextNode("Status of Last Purge Requests"));
  invalidations.appendChild(title);
  var ol = document.createElement('ul');
  ol.id = "invallist";
  for (i=0;i<invals.length;i++){
    var box = document.createElement('li');
    box.className = "invalbox";
    var el = document.createElement('div');
    el.className = "id";
    el.appendChild(document.createTextNode(invals[i].Id["#text"]));
    var st = document.createElement('div');
    st.className = "status " + invals[i].Status["#text"];
    //box.classList.add(invals[i].Status["#text"]);
    var status = invals[i].Status["#text"];
    if (status == "InProgress"){
      status = "In progress";
    }
    /*var link = document.createElement('div');
    link.className = "details";
    link.appendChild(document.createTextNode("details")); */

    st.appendChild(document.createTextNode(status));
    box.appendChild(el);
    box.appendChild(st);
    //box.appendChild(link);
    //box.onclick = invaldetails;
    ol.appendChild(box);
    invalidations.appendChild(ol);

    var indexcur = searchobjlist(pendinginvalidations, invals[i].Id["#text"]);
    if (invals[i].Status["#text"] == "InProgress"){
      // current invalidation is in progress
      if (indexcur == -1){
        //current invalidation was not discovered earlier
        pendinginvalidations.push({id: invals[i].Id["#text"], distid:window.currentdist.toString()});
      }
    }
  }

  document.getElementById("newinval").style.display = "";
  $( "#invallist" ).selectable();
  $( "#invallist" ).bind( "selectableselected", function(event, ui) {
    id = ui.selected.getElementsByClassName("id")[0].innerHTML;
    //console.log(id);
    cfobj.getInvalidationDetails(currentdist, id, updateinvaldetails);
    //window.currentdist = id;
    //cfobj.getAllInvalidations(id, updateinvalidations);
  });
}

var searchobjlist = function(list, id){
  for(k=0;k<list.length;k++){
    if (list[k].id == id){
      return k
    } 
  }
  return -1
}



var auth = function(){
  var secret = document.getElementById("AWSsecret").value
  var access = document.getElementById("AWSaccess").value
  document.getElementById("loginspinner").style.display = "block";
  window.cfobj = new cloudfrontapi(access, secret);
  localStorage.savebox = document.getElementById("savecredentials").checked;
  if (document.getElementById("savecredentials").checked){
    localStorage.access=access;
    localStorage.secret=secret;
  } else {
    //delete previously saved creds if any
    localStorage.access="";
    localStorage.secret="";
  }

  var success = function(dist){
    //hide the login box
    document.getElementById("loginspinner").style.display = "none";
    var loginbox = document.getElementById("auth")
    loginbox.style.display="none";
    updatedistlist(dist);
	_gaq.push(["_trackEvent","Tools","CF Purge Tool","Sign in success",,!0])
    croncheck();
  }

  cfobj.getAllDistributions(success, function(error){
    document.getElementById("loginspinner").style.display = "none";
    document.getElementById("loginerror").style.display = "block";
    document.getElementById("loginerror").innerHTML = getErrorMsg(error);
  });
}


$(document).ready(function() {
  /*
  var notification = webkitNotifications.createNotification(
    'icon.png',  // icon url - can be relative
    'Hello World!',  // notification title
    'Welcome to this extension...'  // notification body text
  );
  notification.show();
  */
  var access = localStorage.access;
  var secret = localStorage.secret;
  if (localStorage.savebox != undefined) {
    document.getElementById("savecredentials").checked = JSON.parse(localStorage.savebox);
  }
  if ((access != undefined) && (secret != undefined)){
    document.getElementById("AWSsecret").value = secret;
    document.getElementById("AWSaccess").value = access;
  }
});