// OBJParser.js
// (c) Original authors and modifications by Jeppe Revall Frisvad and extended by request.

//------------------------------------------------------------------------------
// readOBJFile
//------------------------------------------------------------------------------
async function readOBJFile(fileName, scale, reverse)
{
  const response = await fetch(fileName);
  if(response.ok)
  {
    var objDoc = new OBJDoc(fileName); // Create an OBJDoc object
    let fileText = await response.text();
    let result = await objDoc.parse(fileText, scale, reverse);
    if(!result) {
      console.log("OBJ file parsing error.");
      return null;
    }
    return objDoc.getDrawingInfo();
  }
  else
    return null;
}

//------------------------------------------------------------------------------
// OBJDoc
//------------------------------------------------------------------------------
var OBJDoc = function (fileName) {
  this.fileName = fileName;
  this.mtls = new Array(0);      // Initialize for MTL
  this.objects = new Array(0);   // Initialize for Object
  this.vertices = new Array(0);  // Initialize for Vertex
  this.normals = new Array(0);   // Initialize for Normal
  this.texCoords = new Array(0); // Initialize for Texture Coordinates
};

OBJDoc.prototype.parse = async function (fileString, scale, reverse) {
  var lines = fileString.split('\n');  // Break up into lines
  lines.push(null); // Append null
  var index = 0;

  var currentObject = new OBJObject("");
  this.objects.push(currentObject);
  var currentMaterialName = "";

  var sp = new StringParser();

  while (true) {
    var line = lines[index++]; 
    if (line == null) break;
    sp.init(line);
    var command = sp.getWord();
    if (command == null) continue;

    switch (command) {
      case '#':
        // Skip comments
        continue;
      case 'mtllib':
        var path = this.parseMtllib(sp, this.fileName);
        var mtl = new MTLDoc();
        this.mtls.push(mtl);
        {
          const response = await fetch(path);
          if (response.ok) {
            onReadMTLFile(await response.text(), mtl);
          } else {
            mtl.complete = true;
          }
        }
        continue;
      case 'o':
      case 'g':
        if (currentObject.numIndices == 0) {
          currentObject = this.parseObjectName(sp);
          this.objects[0] = currentObject;
        } else {
          var object = this.parseObjectName(sp);
          this.objects.push(object);
          currentObject = object;
        }
        continue;
      case 'v':
        var vertex = this.parseVertex(sp, scale);
        this.vertices.push(vertex);
        continue;
      case 'vn':
        var normal = this.parseNormal(sp);
        this.normals.push(normal);
        continue;
      case 'vt':
        var texCoord = this.parseTexCoord(sp);
        this.texCoords.push(texCoord);
        continue;
      case 'usemtl':
        currentMaterialName = this.parseUsemtl(sp);
        continue;
      case 'f':
        var face = this.parseFace(sp, currentMaterialName, this.vertices, this.normals, this.texCoords, reverse);
        currentObject.addFace(face);
        continue;
    }
  }

  return true;
};

OBJDoc.prototype.parseMtllib = function (sp, fileName) {
  var i = fileName.lastIndexOf("/");
  var dirPath = "";
  if (i > 0) dirPath = fileName.substr(0, i + 1);
  return dirPath + sp.getWord();   // Get path
};

OBJDoc.prototype.parseObjectName = function (sp) {
  var name = sp.getWord();
  return (new OBJObject(name));
};

OBJDoc.prototype.parseVertex = function (sp, scale) {
  var x = sp.getFloat() * scale;
  var y = sp.getFloat() * scale;
  var z = sp.getFloat() * scale;
  return (new Vertex(x, y, z));
};

OBJDoc.prototype.parseNormal = function (sp) {
  var x = sp.getFloat();
  var y = sp.getFloat();
  var z = sp.getFloat();
  return (new Normal(x, y, z));
};

OBJDoc.prototype.parseTexCoord = function(sp) {
  var u = sp.getFloat();
  var v = sp.getFloat();
  return {u: u, v: v};
};

OBJDoc.prototype.parseUsemtl = function (sp) {
  return sp.getWord();
};

OBJDoc.prototype.parseFace = function (sp, materialName, vertices, normals, texCoords, reverse) {
  var face = new Face(materialName);

  // Each 'f' line can be like "f v/t/n v/t/n v/t/n..."
  for (;;) {
    var word = sp.getWord();
    if (word == null) break;
    var subWords = word.split('/');
    // subWords[0] = vertex index
    // subWords[1] = texCoord index (if present)
    // subWords[2] = normal index (if present)

    // Vertex index
    if (subWords.length >= 1) {
      var vi = parseInt(subWords[0]) - 1;
      if (!isNaN(vi))
        face.vIndices.push(vi);
      else
        face.vIndices.push(-1);
    }

    // Texture coordinate index
    if (subWords.length >= 2 && subWords[1].length > 0) {
      var ti = parseInt(subWords[1]) - 1;
      if (!isNaN(ti))
        face.tIndices.push(ti);
      else
        face.tIndices.push(-1);
    } else {
      face.tIndices.push(-1);
    }

    // Normal index
    if (subWords.length >= 3 && subWords[2].length > 0) {
      var ni = parseInt(subWords[2]) - 1;
      if (!isNaN(ni))
        face.nIndices.push(ni);
      else
        face.nIndices.push(-1);
    } else {
      face.nIndices.push(-1);
    }
  }

  // Compute the face normal if not all normals are present
  var v0 = [ vertices[face.vIndices[0]].x,
             vertices[face.vIndices[0]].y,
             vertices[face.vIndices[0]].z ];
  var v1 = [ vertices[face.vIndices[1]].x,
             vertices[face.vIndices[1]].y,
             vertices[face.vIndices[1]].z ];
  var v2 = [ vertices[face.vIndices[2]].x,
             vertices[face.vIndices[2]].y,
             vertices[face.vIndices[2]].z ];

  var normal = calcNormal(v0, v1, v2);
  if (normal == null) {
    if (face.vIndices.length >= 4) {
      var v3 = [ vertices[face.vIndices[3]].x,
                 vertices[face.vIndices[3]].y,
                 vertices[face.vIndices[3]].z ];
      normal = calcNormal(v1, v2, v3);
    }
    if (normal == null) {
      normal = [0.0, 1.0, 0.0];
    }
  }
  if (reverse) {
    normal[0] = -normal[0];
    normal[1] = -normal[1];
    normal[2] = -normal[2];
  }
  face.normal = new Normal(normal[0], normal[1], normal[2]);

  // Triangulate if face contains more than 3 points
  if (face.vIndices.length > 3) {
    var n = face.vIndices.length - 2;
    var newVIndices = new Array(n * 3);
    var newNIndices = new Array(n * 3);
    var newTIndices = new Array(n * 3);
    for (var i = 0; i < n; i++) {
      newVIndices[i*3+0] = face.vIndices[0];
      newVIndices[i*3+1] = face.vIndices[i+1];
      newVIndices[i*3+2] = face.vIndices[i+2];

      newTIndices[i*3+0] = face.tIndices[0];
      newTIndices[i*3+1] = face.tIndices[i+1];
      newTIndices[i*3+2] = face.tIndices[i+2];

      newNIndices[i*3+0] = face.nIndices[0];
      newNIndices[i*3+1] = face.nIndices[i+1];
      newNIndices[i*3+2] = face.nIndices[i+2];
    }
    face.vIndices = newVIndices;
    face.tIndices = newTIndices;
    face.nIndices = newNIndices;
  }
  face.numIndices = face.vIndices.length;

  return face;
};

// Analyze the material file
function onReadMTLFile(fileString, mtl) {
  var lines = fileString.split('\n');  // Break up into lines and store them as array
  lines.push(null);           // Append null
  var index = 0;              // Initialize index of line

  // Parse line by line
  var line;      // A string in the line to be parsed
  var name = ""; // Material name
  var sp = new StringParser();  // Create StringParser
  while ((line = lines[index++]) != null) {
    sp.init(line);                  // init StringParser
    var command = sp.getWord();     // Get command
    if (command == null) continue;  // check null command

    switch (command) {
      case '#':
        continue;    // Skip comments
      case 'newmtl': // Read Material chunk
        name = mtl.parseNewmtl(sp);    // Get name
        continue; // Go to the next line
      case 'Kd':   // Read diffuse color coefficient as color
        if (name == "") continue; // Go to the next line because of Error
        var material = mtl.parseRGB(sp, name);
        mtl.materials.push(material);
        name = "";
        continue; // Go to the next line
    }
  }
  mtl.complete = true;
}

// Check if MTL is complete
OBJDoc.prototype.isMTLComplete = function () {
  if (this.mtls.length == 0) return true;
  for (var i = 0; i < this.mtls.length; i++) {
    if (!this.mtls[i].complete) return false;
  }
  return true;
};

OBJDoc.prototype.findColor = function (name) {
  for (var i = 0; i < this.mtls.length; i++) {
    for (var j = 0; j < this.mtls[i].materials.length; j++) {
      if (this.mtls[i].materials[j].name == name) {
        return (this.mtls[i].materials[j].color);
      }
    }
  }
  return (new Color(0.8, 0.8, 0.8, 1));
};

OBJDoc.prototype.getDrawingInfo = function () {
  var numIndices = 0;
  for (var i = 0; i < this.objects.length; i++) {
    numIndices += this.objects[i].numIndices;
  }
  var numVertices = this.vertices.length;

  var vertices = new Float32Array(numVertices * 4);
  var normals = new Float32Array(numVertices * 4);
  var colors = new Float32Array(numVertices * 4);
  var indices = new Uint32Array(numIndices);

  // If there are texture coordinates, create array
  var hasTexCoords = (this.texCoords.length > 0);
  var texCoordsArr = null;
  if (hasTexCoords) {
    texCoordsArr = new Float32Array(numVertices * 2);
  }

  var index_indices = 0;
  for (var i = 0; i < this.objects.length; i++) {
    var object = this.objects[i];
    for (var j = 0; j < object.faces.length; j++) {
      var face = object.faces[j];
      var color = this.findColor(face.materialName);
      var faceNormal = face.normal;
      for (var k = 0; k < face.vIndices.length; k++) {
        var vIdx = face.vIndices[k];
        indices[index_indices] = vIdx;

        var vertex = this.vertices[vIdx];
        vertices[vIdx*4+0] = vertex.x;
        vertices[vIdx*4+1] = vertex.y;
        vertices[vIdx*4+2] = vertex.z;
        vertices[vIdx*4+3] = 1.0;

        colors[vIdx*4+0] = color.r;
        colors[vIdx*4+1] = color.g;
        colors[vIdx*4+2] = color.b;
        colors[vIdx*4+3] = color.a;

        var nIdx = face.nIndices[k];
        if (nIdx >= 0) {
          var normal = this.normals[nIdx];
          normals[vIdx*4+0] = normal.x;
          normals[vIdx*4+1] = normal.y;
          normals[vIdx*4+2] = normal.z;
          normals[vIdx*4+3] = 0.0;
        } else {
          normals[vIdx*4+0] = faceNormal.x;
          normals[vIdx*4+1] = faceNormal.y;
          normals[vIdx*4+2] = faceNormal.z;
          normals[vIdx*4+3] = 0.0;
        }

        if (hasTexCoords) {
          var tIdx = face.tIndices[k];
          if (tIdx >= 0) {
            var tCoord = this.texCoords[tIdx];
            texCoordsArr[vIdx*2+0] = tCoord.u;
            texCoordsArr[vIdx*2+1] = tCoord.v;
          } else {
            // If no texture coord, set 0
            texCoordsArr[vIdx*2+0] = 0.0;
            texCoordsArr[vIdx*2+1] = 0.0;
          }
        }

        index_indices++;
      }
    }
  }

  var drawingInfo = new DrawingInfo(vertices, normals, colors, indices);
  if (hasTexCoords) {
    drawingInfo.texCoords = texCoordsArr;
  }

  return drawingInfo;
};

//------------------------------------------------------------------------------
// MTLDoc
//------------------------------------------------------------------------------
var MTLDoc = function () {
  this.complete = false; 
  this.materials = new Array(0);
};

MTLDoc.prototype.parseNewmtl = function (sp) {
  return sp.getWord();
};

MTLDoc.prototype.parseRGB = function (sp, name) {
  var r = sp.getFloat();
  var g = sp.getFloat();
  var b = sp.getFloat();
  return new Material(name, r, g, b, 1);
};

//------------------------------------------------------------------------------
// Material
//------------------------------------------------------------------------------
var Material = function (name, r, g, b, a) {
  this.name = name;
  this.color = new Color(r, g, b, a);
};

//------------------------------------------------------------------------------
// Vertex, Normal, Color
//------------------------------------------------------------------------------
var Vertex = function (x, y, z) {
  this.x = x; this.y = y; this.z = z;
};

var Normal = function (x, y, z) {
  this.x = x; this.y = y; this.z = z;
};

var Color = function (r, g, b, a) {
  this.r = r; this.g = g; this.b = b; this.a = a;
};

//------------------------------------------------------------------------------
// OBJObject
//------------------------------------------------------------------------------
var OBJObject = function (name) {
  this.name = name;
  this.faces = new Array(0);
  this.numIndices = 0;
};

OBJObject.prototype.addFace = function (face) {
  this.faces.push(face);
  this.numIndices += face.numIndices;
};

//------------------------------------------------------------------------------
// Face
//------------------------------------------------------------------------------
var Face = function (materialName) {
  this.materialName = materialName || "";
  this.vIndices = new Array(0);
  this.tIndices = new Array(0);
  this.nIndices = new Array(0);
  this.numIndices = 0;
};

//------------------------------------------------------------------------------
// DrawingInfo
//------------------------------------------------------------------------------
var DrawingInfo = function (vertices, normals, colors, indices) {
  this.vertices = vertices;
  this.normals = normals;
  this.colors = colors;
  this.indices = indices;
  this.texCoords = null; // Will be assigned if available
};

//------------------------------------------------------------------------------
// StringParser
//------------------------------------------------------------------------------
var StringParser = function (str) {
  this.str = str;
  this.index = 0;
};

StringParser.prototype.init = function (str) {
  this.str = str;
  this.index = 0;
};

StringParser.prototype.skipDelimiters = function () {
  for (var i = this.index, len = this.str.length; i < len; i++) {
    var c = this.str.charAt(i);
    if (c == '\t' || c == ' ' || c == '(' || c == ')' || c == '"') continue;
    break;
  }
  this.index = i;
};

StringParser.prototype.skipToNextWord = function () {
  this.skipDelimiters();
  var n = getWordLength(this.str, this.index);
  this.index += (n + 1);
};

StringParser.prototype.getWord = function () {
  this.skipDelimiters();
  var n = getWordLength(this.str, this.index);
  if (n == 0) return null;
  var word = this.str.substr(this.index, n);
  this.index += (n + 1);
  return word;
};

StringParser.prototype.getInt = function () {
  return parseInt(this.getWord());
};

StringParser.prototype.getFloat = function () {
  return parseFloat(this.getWord());
};

function getWordLength(str, start) {
  var i;
  for (i = start, len = str.length; i < len; i++) {
    var c = str.charAt(i);
    if (c == '\t' || c == ' ' || c == '(' || c == ')' || c == '"')
      break;
  }
  return i - start;
}

//------------------------------------------------------------------------------
// calcNormal
//------------------------------------------------------------------------------
function calcNormal(p0, p1, p2) {
  var v0 = new Float32Array(3);
  var v1 = new Float32Array(3);
  for (var i = 0; i < 3; i++) {
    v0[i] = p0[i] - p1[i];
    v1[i] = p2[i] - p1[i];
  }
  var c = new Float32Array(3);
  c[0] = v0[1]*v1[2] - v0[2]*v1[1];
  c[1] = v0[2]*v1[0] - v0[0]*v1[2];
  c[2] = v0[0]*v1[1] - v0[1]*v1[0];

  var x = c[0], y = c[1], z = c[2], g = Math.sqrt(x*x+y*y+z*z);
  if (g) {
    g = 1/g;
    c[0] = x*g; c[1] = y*g; c[2] = z*g;
  } else {
    c[0] = 0; c[1] = 0; c[2] = 0;
  }
  return c;
}