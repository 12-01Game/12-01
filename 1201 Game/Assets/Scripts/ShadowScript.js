/*
 *	ShadowScript.js
 *
 *	Version 1.0
 *	Coded with <3 by Jonathan Ballands && Wil Collins
 *
 *	Written for the 12:01 video game
 */

#pragma strict
 
// Variable Settings
var objToWallDistance : float = 0;		// Stores how far away the GameObject's back edge is from the wall
var scalingWidthVar : float = 1;		// Stores how the shadow should scale in size with respect to the size of the GameObject
var scalingHeightVar : float = 1;		// Stores how the shadow should scale in size with respect to the size of the GameObject

var skewAmount : float = 25.0;			// The skewing factor for shadows (+more -less)
var triggerDistance : float = 20.0;		// The distance at which Shadow Skewing is triggered

var shadowTexture : Material;			// Stores the texture for the shadow
var reverseTriWinding : boolean;		// This prevents the "backfacing" problem
var player : Transform;					// Stores the player object to detect distance

var createShadowOnStart : boolean = false;	// When true, the shadow will be created when the scene starts. Otherwise, you will have to call
											// createShadow() explicitly to make the shadow.

private var heightScaleOffset : float;		// This is here so that scaled shadows still line up against the wall!

private var hasLogic : boolean = true;

// Object properties
private var objWidth : float;		// Stores the GameObject's width
private var objHeight : float;		// Stores the GameObject's height

private var objOriginX : float;		// Stores where the GameObject is in space
private var objOriginY : float;		// Stores where the GameObject is in space
private var objOriginZ : float;		// Stores where the GameObject is in space

// Shadow properties
private var shadowMesh : Mesh;
private var shadow : GameObject;
private var shadowCollider : BoxCollider;

// Skewing variables
private var vertices : Vector3[];
private var verticesOrig : Vector3[];
private var skew : Vector3[];
private var dist : float;

// Environment variables
private var levelHeight : float = 30.0;
private var levelDepth : float = 50.0;
private var left : Vector3;

/*
 *	Start()
 *
 *	Called as the object gets initialized.
 */
function Start () {

	// Initialize GameObject properties
	objWidth = renderer.bounds.size.z;
	objHeight = renderer.bounds.size.y;
	objOriginX = renderer.transform.position.x;
	objOriginY = renderer.transform.position.y;
	objOriginZ = renderer.transform.position.z;
	
	// Do some scaling
	heightScaleOffset = ((objHeight * scalingHeightVar) - objHeight) / 2;
	objWidth = objWidth * scalingWidthVar;
	objHeight = objHeight * scalingWidthVar;
	
	// Make our own collider
	shadowCollider = gameObject.AddComponent("BoxCollider");
	shadowCollider.size = new Vector3(100, levelHeight, levelDepth);
	// Use our triggers
	shadowCollider.isTrigger = true;
	
	left = transform.TransformDirection(Vector3.back);	// player is moving left when facing back

	// Go
	if (createShadowOnStart) {
		hasLogic = true;
		ActivateShadow();
	}
}

/*
 *	Update()
 *
 *	Called as the object updates in realtime.
 */
function Update () {
	if (hasLogic) {
		VerifyShadow();		// Verify the shadow's location based on its parent object
	}
}

/*
 *	CreateShadow()
 *
 *	Explicitly tells the ShadowScript to begin generating collidable shadows for this object.
 */
function CreateShadow() {
	if (!hasLogic) {
		hasLogic = true;
		ActivateShadow();
	}
}

/*
 *	RemoveShadow()
 *
 *	Explicitly tells the ShadowScript to remove collidable shadows for this object.
 */
function RemoveShadow() {
	if (hasLogic) {
		hasLogic = false;
		
		// Remove shadow
		shadowMesh = null;
		shadow = null;
		shadowCollider = null;
	}
}

/*
 *	ActivateShadow()
 *
 *	Kicks off the shadow creation process by generating a Mesh
 *	for the shadow to reside on.
 */
function ActivateShadow() {

	// Make a new shadow mesh
	shadowMesh = new Mesh();
	shadowMesh.name = "Shadow_Mesh_" + gameObject.name;

	// Define vertices
	var tempX : float = objOriginX - (objWidth / 2);
	var tempY : float = objOriginY - (objHeight / 2);
	var tempZ : float = objOriginZ;
	shadowMesh.vertices = [Vector3(tempX, tempY + heightScaleOffset, tempZ - objToWallDistance),
						   Vector3(tempX + objWidth, tempY + heightScaleOffset, tempZ - objToWallDistance),
						   Vector3(tempX + objWidth, tempY + objHeight + heightScaleOffset, tempZ - objToWallDistance),
						   Vector3(tempX, tempY + objHeight + heightScaleOffset, tempZ - objToWallDistance)];
						   
	SetSkewVertices();	// Set skew vertices based on new vertices	   					   
						   
	// Define triangles
	if (reverseTriWinding) {
		shadowMesh.triangles = [2, 1, 0, 3, 2, 0];
	}
	else {
		shadowMesh.triangles = [0, 1, 2, 0, 2, 3];
	}
	
	shadowMesh.RecalculateNormals();	// Define normals
	shadowMesh.uv = [Vector2 (0, 0), Vector2 (0, 1), Vector2(1, 1), Vector2 (1, 0)];	// Define UVs
	
	// Create the shadow plane
	shadow = new GameObject("Shadow_Object_" + gameObject.name, MeshRenderer, MeshFilter, MeshCollider);
	
	var mc : MeshCollider = shadow.AddComponent("MeshCollider");
	mc.sharedMesh = shadowMesh;
	shadow.renderer.material = shadowTexture;
}

/*
 *	VerifyShadow()
 *
 *	Redraws the shadow with a new position, if the parent object has been moved.
 */
function VerifyShadow() {

	var isInvalid : boolean = false;
	
	// If the position has changed, invalidate the shadow
	var newX : float = renderer.transform.position.x;
	var newY : float = renderer.transform.position.y;
	var newZ : float = renderer.transform.position.z;
	if (!newX.Equals(objOriginX) || !newY.Equals(objOriginY) || !newZ.Equals(objOriginZ)) {
		
		// Respecify fields and invalidate
		objOriginX = newX;
		objOriginY = newY;
		objOriginZ = newZ;
		isInvalid = true;
	}
	
	// Reposition, if necessary
	if (isInvalid) {
		RepositionShadow();
	}
}

/*
 *	RepositionShadow()
 *
 *	Repositions the shadow in space.
 *
 *	NEVER CALL THIS FUNCTION DIRECTLY (use VerifyShadow() instead)
 */
function RepositionShadow() {
	
	// Define vertices
	var tempX : float = objOriginX - (objWidth / 2);
	var tempY : float = objOriginY - (objHeight / 2);
	var tempZ : float = objOriginZ;
	shadowMesh.vertices = [Vector3(tempX, tempY + heightScaleOffset, tempZ - objToWallDistance),
						   Vector3(tempX + objWidth, tempY + heightScaleOffset, tempZ - objToWallDistance),
						   Vector3(tempX + objWidth, tempY + objHeight + heightScaleOffset, tempZ - objToWallDistance),
						   Vector3(tempX, tempY + objHeight + heightScaleOffset, tempZ - objToWallDistance)];
	
	SetSkewVertices();	// Set skew vertices based on new vertices
						   
	// Define triangles
	if (reverseTriWinding) {
		shadowMesh.triangles = [2, 1, 0, 3, 2, 0];
	}
	else {
		shadowMesh.triangles = [0, 1, 2, 0, 2, 3];
	}
	
	shadowMesh.RecalculateNormals();	// Define normals
	shadowMesh.uv = [Vector2 (0, 0), Vector2 (0, 1), Vector2(1, 1), Vector2 (1, 0)];	// Define UVs
	
	// Apply mesh
	shadow.GetComponent(MeshFilter).mesh = shadowMesh;
	shadow.renderer.material = shadowTexture;
}

/*
 *	SetSkewVertices()
 *
 *	Sets the vertices used for skewing
 */
function SetSkewVertices(){

	vertices = shadowMesh.vertices;
	verticesOrig = shadowMesh.vertices;
	
	if (skew == null) {
		InitSkewVectors();
	}
}

/*
 *	InitSkewVectors()
 *
 *	These vectors represent the skewing magnitudes
 */
function InitSkewVectors(){

	skew = shadowMesh.vertices;
	var count : int = 0;
	var root : int = Mathf.Sqrt(skew.length);	// this is currently designed for square planes
	
	for(var i : int = 0; i < root; i++) {
		for(var j : int = 0; j < root; j++) {
			var skw : float = i / skewAmount;
			skew[count++] = Vector3(skw, 0, 0);
		}
	}
}

/*
 *	SkewShadow()
 *
 *	Skews the shadow in relation to the player's position 
 */
function SkewShadow() {
	
	// TODO : We will need to add an opacity fade-in to the shadow at triggerDistance
	dist = verticesOrig[0].x - player.position.x;
	
	if(isFacing()){
		if (dist > (-1 * triggerDistance) && dist < triggerDistance) {
			for (var p : int = 0; p < vertices.length; p++) {
				vertices[p] = Vector3(verticesOrig[p].x + dist/10 + skew[p].x * dist, verticesOrig[p].y, verticesOrig[p].z);
			}
		} 
	}
	else {
		// TODO: Hide shadow (with very quick Opacity fade-out?)

	}
	shadowMesh.vertices = vertices;
}

/*
 *	isFacing()
 *
 *	Checks to see if the player is facing towards this object
 */
function isFacing() {

	var vector : Vector3 = player.right;
	
	Debug.Log(vector);
	
	// Facing left
	if (vector == Vector3(-1,0,0)) {
	
		if (dist < 0){ 		// player is on the left of the object, NOT FACING
			return false;
		} else {			// player is on the right of the object, IS FACING
			return true;
		}
	} 
	
	// Facing right
	else {
	
		if (dist < 0) { 		// player is on the left of the object, IS FACING
			return true;
		} else {			// player is on the right of the object, NOT FACING
			return false;
		}
	
	}
	
}

/* Triggers */

function OnTriggerEnter (other : Collider) {
	SkewShadow();
}
function OnTriggerStay (other : Collider) {
	SkewShadow();
}
