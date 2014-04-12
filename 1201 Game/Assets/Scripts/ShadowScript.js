/*
 *	ShadowScript.js
 *
 *	The engine that generates interactive shadows in the game world.
 *
 *	Version 1.0
 *	Coded with <3 by Jonathan Ballands && Wil Collins
 *
 *	(C)2014 All Rights Reserved.
 */

#pragma strict
 
// Variable Settings
var shadowTexture 				: Material;			// Stores the texture for the shadow
var reverseTriWinding 			: boolean;			// This prevents the "backfacing" problem

var scalingWidthVar 			: float 	= 1.0;			// shadow width scale in respect to gameobject
var scalingHeightVar 			: float 	= 1.0;			// shadow height scale in respect to gameobject
var triggerDistance 			: float 	= 60.0;			// distance at which Shadow Skewing is triggered

// Environment settings
private final var WALL_NAME 	: String 	= "BackWall";	// Name identifier for the back wall to calculate objDistanceToWall
private final var SAM_NAME 		: String 	= "Test Sam";	// Name indentifier for the player to calculate distance from obj
private final var LEVEL_HEIGHT 	: float 	= 30.0;			// self explanatory
private final var LEVEL_DEPTH 	: float 	= 50.0;			// self explanatory
private final var SHADOW_OFFSET	: float		= 0.01;			// distance shadow is offset from plane

// Object properties
private var objWidth 			: float;			// GameObject's width
private var objHeight 			: float;			// GameObject's height
private var objDepth 			: float;			// GameObject's depth
private var heightScaleOffset 	: float;			// The height offset produced by scaling
private var objOriginX 			: float;			// where the GameObject is in space
private var objOriginY 			: float;			// where the GameObject is in space
private var objOriginZ 			: float;			// where the GameObject is in space
private var objToWallDistance 	: float;			// how far away the GameObject's back edge is from the wall

// Shadow properties
private var shadowMeshV 		: Mesh;				// mesh for vertical shadow plane
private var shadowMeshH 		: Mesh;				// mesh for horizontal shadow plane
private var shadowV 			: GameObject;		// gameobject for vertical shadow plane
private var shadowH 			: GameObject;		// gameobject for horizontal shadow plane
private var proximityCollider 	: BoxCollider;		// collider to detect player proximity to object (when to display shadow)
private var isVisible 			: boolean = false;	// whether or not the shadow is currently visible

// Environment variables
private var player 				: Transform;		// the player object to detect distance
private var left 				: Vector3;			// left facing vector based on level orientation
private var dist 				: float;			// player distance from gameobject

/*
 *	Start()
 *
 *	Called as the object gets initialized.
 */
function Start () {
	player = GameObject.Find(SAM_NAME).transform;

	// Initialize GameObject properties
	objWidth = renderer.bounds.size.z;
	objHeight = renderer.bounds.size.y;
	objDepth = renderer.bounds.size.z;
	
	objOriginX = renderer.transform.position.x;
	objOriginY = renderer.transform.position.y;
	objOriginZ = renderer.transform.position.z;
	
	// Do some scaling
	heightScaleOffset = ((objHeight * scalingHeightVar) - objHeight) / 2;
	objWidth = objWidth * scalingWidthVar;
	objHeight = objHeight * scalingWidthVar;	
	
	left = transform.TransformDirection(Vector3.back);	// player is moving left when facing back
	
	var wall : GameObject = GameObject.Find(WALL_NAME);
	objToWallDistance = Mathf.Abs(objOriginZ - objDepth / 2 - wall.renderer.transform.position.z) - SHADOW_OFFSET;
	
	// Add a collider to the object so that it can detect when to skew
	proximityCollider = gameObject.AddComponent("BoxCollider");
	proximityCollider.size = new Vector3(60, LEVEL_HEIGHT, LEVEL_DEPTH);
	proximityCollider.isTrigger = true;

}

/*
 *	Update()
 *
 *	Called as the object updates in realtime.
 */
function Update () {
	if (isVisible) {
		VerifyShadow();		// Verify the shadow's location based on its parent object
	}
}

/*
 *	CreateShadow()
 *
 *	Explicitly tells the ShadowScript to begin generating collidable shadows for this object.
 */
function CreateShadow() {
	if (!isVisible) {
		isVisible = true;
		ActivateShadow();
	}
}

/*
 *	RemoveShadow()
 *
 *	Explicitly tells the ShadowScript to remove collidable shadows for this object.
 */
function RemoveShadow() {
	if (isVisible) {
		isVisible = false;
		
		// Remove shadow
		Destroy(shadowV);
		Destroy(shadowH);
		
		// Erase local variables
		shadowMeshV = null;
		shadowMeshH = null;
		shadowV = null;
		shadowH = null;
		proximityCollider = null;
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
	shadowMeshV = new Mesh();
	shadowMeshH = new Mesh();
	
	// Define vertices
	var xRight : float = objOriginX - (objWidth / 2);
	var yFloor : float = objOriginY - (objHeight / 2) + SHADOW_OFFSET;
	var zBack : float = objOriginZ - (objDepth / 2);
	
	shadowMeshV.name = gameObject.name + "_Shadow_Mesh_V";
	shadowMeshV.vertices = [Vector3(xRight, yFloor + heightScaleOffset, zBack - objToWallDistance),
					   Vector3(xRight + objWidth, yFloor + heightScaleOffset, zBack - objToWallDistance),
					   Vector3(xRight + objWidth, yFloor + objHeight + heightScaleOffset, zBack - objToWallDistance),
					   Vector3(xRight, yFloor + objHeight + heightScaleOffset, zBack - objToWallDistance)];		

	shadowMeshH.name = gameObject.name + "_Shadow_Mesh_H";
	shadowMeshH.vertices = [Vector3(xRight, yFloor, zBack - objToWallDistance),
					   Vector3(xRight + objWidth, yFloor, zBack - objToWallDistance),
					   Vector3(xRight + objWidth, yFloor, zBack),
					   Vector3(xRight, yFloor, zBack)];  					   
						   
	// Define triangles
	if (reverseTriWinding) {
		shadowMeshV.triangles = [2, 1, 0, 3, 2, 0];
		shadowMeshH.triangles = [2, 1, 0, 3, 2, 0];
	}
	else {
		shadowMeshV.triangles = [0, 1, 2, 0, 2, 3];
		shadowMeshH.triangles = [0, 1, 2, 0, 2, 3];
	}
	
	shadowMeshV.RecalculateNormals();	// Define normals
	shadowMeshV.uv = [Vector2 (0, 0), Vector2 (0, 1), Vector2(1, 1), Vector2 (1, 0)];	// Define UVs
	
	shadowMeshH.RecalculateNormals();	// Define normals
	shadowMeshH.uv = [Vector2 (0, 0), Vector2 (0, 1), Vector2(1, 1), Vector2 (1, 0)];	// Define UVs
	
	// Create the shadow plane
	shadowV = new GameObject(gameObject.name + "_Shadow_V", MeshRenderer, MeshFilter, MeshCollider);
	shadowH = new GameObject(gameObject.name + "_Shadow_H", MeshRenderer, MeshFilter, MeshCollider);
	
	// Add a collider to the shadow so that Hank can touch it
	var shadowColliderV : MeshCollider = shadowV.AddComponent("MeshCollider");
	shadowColliderV.sharedMesh = shadowMeshV;
	shadowV.renderer.material = shadowTexture;
	
	// Add a collider to the shadow so that Hank can touch it
	var shadowColliderH : MeshCollider = shadowH.AddComponent("MeshCollider");
	shadowColliderH.sharedMesh = shadowMeshH;
	shadowH.renderer.material = shadowTexture;
	
	var meshFilterVert : MeshFilter = shadowV.GetComponent("MeshFilter");
	meshFilterVert.sharedMesh = shadowMeshV;
	
	var meshFilterHor : MeshFilter = shadowH.GetComponent("MeshFilter");
	meshFilterHor.sharedMesh = shadowMeshH;
	
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
	var xRight : float = objOriginX - (objWidth / 2);
	var yFloor : float = objOriginY - (objHeight / 2) + SHADOW_OFFSET;
	var zBack : float = objOriginZ - (objDepth / 2);
	
	shadowMeshV.vertices = [Vector3(xRight, yFloor + heightScaleOffset, zBack - objToWallDistance),
						   Vector3(xRight + objWidth, yFloor + heightScaleOffset, zBack - objToWallDistance),
						   Vector3(xRight + objWidth, yFloor + objHeight + heightScaleOffset, zBack - objToWallDistance),
						   Vector3(xRight, yFloor + objHeight + heightScaleOffset, zBack - objToWallDistance)];
						   
	
	shadowMeshH.vertices = [Vector3(xRight, yFloor, zBack - objToWallDistance),
						   Vector3(xRight + objWidth, yFloor, zBack - objToWallDistance),
						   Vector3(xRight + objWidth, yFloor, zBack),
						   Vector3(xRight, yFloor, zBack)];
						   
	// Define triangles
	if (reverseTriWinding) {
		shadowMeshV.triangles = [2, 1, 0, 3, 2, 0];
		shadowMeshH.triangles = [2, 1, 0, 3, 2, 0];
	}
	else {
		shadowMeshV.triangles = [0, 1, 2, 0, 2, 3];
		shadowMeshH.triangles = [0, 1, 2, 0, 2, 3];
	}
	
	shadowMeshV.RecalculateNormals();	// Define normals
	shadowMeshV.uv = [Vector2 (0, 0), Vector2 (0, 1), Vector2(1, 1), Vector2 (1, 0)];	// Define UVs
	
	shadowMeshH.RecalculateNormals();	// Define normals
	shadowMeshH.uv = [Vector2 (0, 0), Vector2 (0, 1), Vector2(1, 1), Vector2 (1, 0)];	// Define UVs
	
	// Apply mesh
	shadowV.GetComponent(MeshFilter).mesh = shadowMeshV;
	shadowV.renderer.material = shadowTexture;
	
	shadowH.GetComponent(MeshFilter).mesh = shadowMeshH;
	shadowH.renderer.material = shadowTexture;
	
	var wall : GameObject = GameObject.Find(WALL_NAME);
	objToWallDistance = Mathf.Abs(objOriginZ - objDepth / 2 - wall.renderer.transform.position.z) - SHADOW_OFFSET;
}

/*
 *	SkewShadow()
 *
 *	Skews the shadow in relation to the player's position 
 */
function SkewShadow() {
	if(!isVisible)
		CreateShadow();
	
	dist = objOriginX - player.position.x;
	var x = player.position.x;
	var z = player.position.z;
	
	if(isFacing()){
		if(dist < triggerDistance / 2 && dist > triggerDistance / -2){
			var xRight : float = objOriginX - (objWidth / 2);
			var xLeft : float = objOriginX + (objWidth / 2);
			var yFloor : float = objOriginY - (objHeight / 2) + SHADOW_OFFSET;
			var zBack : float = objOriginZ - (objDepth / 2);
			var zFront : float = objOriginZ + (objDepth / 2);
			

			if(dist > objWidth / 2){ // on the right
				var distX = Mathf.Abs(x - xRight);
				var distZ = Mathf.Abs(z - zBack);
				
				var mNear = distX / distZ;
				
				distX = Mathf.Abs(x - xLeft);
				distZ = Mathf.Abs(z - zFront);
				
				var mFar = distX / distZ;
				shadowMeshV.vertices = [Vector3(xRight + mNear * objToWallDistance, yFloor, zBack - objToWallDistance),
									   Vector3(xLeft - objWidth + mFar * objToWallDistance, yFloor, zBack - objToWallDistance),
									   Vector3(xLeft - objWidth + mFar * objToWallDistance, yFloor + objHeight, zBack - objToWallDistance),
									   Vector3(xRight + mNear * objToWallDistance, yFloor + objHeight, zBack - objToWallDistance)];
					
				shadowMeshH.vertices = [Vector3(xRight + mNear * objToWallDistance, yFloor, zBack - objToWallDistance),
								   Vector3(xLeft - objWidth + mFar * objToWallDistance, yFloor, zBack - objToWallDistance),
								   Vector3(xLeft, yFloor, zFront),
								   Vector3(xRight, yFloor, zBack)];
			}else if (dist < objWidth / -2){	// on the left
				distX = Mathf.Abs(xLeft - x);
				distZ = Mathf.Abs(z - zBack);
				
				mNear = distX / distZ;
				
				distX = Mathf.Abs(xRight - x);
				distZ = Mathf.Abs(z - zFront);
				
				mFar = distX / distZ;
				
				shadowMeshV.vertices = [Vector3(xRight + objWidth - mFar * objToWallDistance, yFloor, zBack - objToWallDistance),
									   Vector3(xLeft - mNear * objToWallDistance, yFloor, zBack - objToWallDistance),
									   Vector3(xLeft - mNear * objToWallDistance, yFloor + objHeight, zBack - objToWallDistance),
									   Vector3(xRight + objWidth - mFar * objToWallDistance, yFloor + objHeight, zBack - objToWallDistance)];
			
				shadowMeshH.vertices = [Vector3(xRight + objWidth - mFar * objToWallDistance, yFloor, zBack - objToWallDistance),
								   Vector3(xLeft - mNear * objToWallDistance, yFloor, zBack - objToWallDistance),
								   Vector3(xLeft, yFloor, zBack),
								   Vector3(xRight, yFloor, zFront)];
			
			}
		}
	}
	else {
		RemoveShadow();
	}	   
}

/*
 *	isFacing()
 *
 *	Checks to see if the player is facing towards this object
 */
function isFacing() {
	var vector : Vector3 = player.right;
	
	if (vector == Vector3(-1,0,0)){	// Facing left
	
		if (dist < 0) return false;	// player is on the left of the object, NOT FACING
		else return true;			// player is on the right of the object, IS FACING
		
	} else {						// Facing right
	
		if (dist < 0) return true;	// player is on the left of the object, IS FACING
		else return false; 			// player is on the right of the object, NOT FACING
		
	}
}

/* Triggers */

function OnTriggerEnter (c : Collider) {
	CreateShadow();
}
function OnTriggerStay (c : Collider) {
	SkewShadow();
}
function OnTriggerExit (c : Collider) {
	RemoveShadow();
} 
