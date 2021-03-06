﻿/*
 *	CharacterScript.js
 *
 *	A script that causes characters in 12:01 to interact with the game world.
 *
 *	Version 1.0
 *	Coded with <3 by Jonathan Ballands
 *
 *	(C)2014 All Rights Reserved.
 */

#pragma strict
@script RequireComponent(CharacterController)

var jumpForce					: float = 10.0f;	// The amount of force that the character jumps with
var speed						: float = 6.0f;		// The speed at which this character moves
var rotationSpeed				: float = 10.0f;	// The speed at which this character rotates

var canRotate					: boolean = true;	// Set this to true if you want the character to rotate
var canJump						: boolean = true;	// Set this to true if you want the character to jump

var gravity						: float = .08;		// Control how much gravity this character is exposed to

private var controller			: CharacterController;			// The CharacterController component that must be attached to this character

private var faceVector			: Vector3 = Vector3.zero;		// The vector the character moves on
private var downVector			: Vector3 = Vector3.down;		// The vector the character falls on
private var savedXMotion		: float = 0;					// When the character is airborne, use this value to launch the character in this direction
private var savedYMotion		: float = 0;					// When the character is airborne, use this value to figure out how much the player should 
																// fall by
private var fallFrames			: int = 1;						// How long has this character been falling?

private var shouldFaceAngle		: float = 180;
private var currFaceAngle		: float = 0;

/*
 *	Awake()
 *
 *	Called when this script wakes up.
 */
function Awake() {
	faceVector = transform.TransformDirection(Vector3.left);
	controller = GetComponent("CharacterController");
}

/*
 *	Update()
 *
 *	Called as this character updates.
 */
function Update () {

	// If the character can rotate, rotate smoothly (Sam)
	if (canRotate) {
		// Use slerp to provide smooth character rotation
		var sfa = Quaternion.Euler(Vector3(0, shouldFaceAngle, 0));
		transform.rotation = Quaternion.Slerp(transform.rotation, sfa, rotationSpeed * Time.deltaTime);
	}
	// Otherwise, don't rotate smoothly at all (Hank)
	else {
		transform.rotation.y = shouldFaceAngle;
	}
	
	var xMotion = 0;
	var yMotion = 0;

	// Grounded...
	if (controller.isGrounded) {
	
		// Reset gravity acceleration
		fallFrames = 1;
		
		// Get desired X-motion
		xMotion = Input.GetAxis("Horizontal") * speed * -1;
		savedXMotion = xMotion;
		
		// No Y-motion
		yMotion = 0;
		
		// Set the angle to turn to, if needed
		if (xMotion > 0) {
			shouldFaceAngle = 180;
		}
		else if (xMotion < 0) {
			shouldFaceAngle = 0;
		}
	}
	
	// Jumping...
	if (controller.isGrounded && Input.GetAxis("Jump") && canJump) {
		yMotion = jumpForce;
		savedYMotion = yMotion;
	}
	
	// Falling...
	else {
		
		// Simulate acceleration by multiplying by the number of frames the character has been airborne for
		yMotion = savedYMotion - (gravity * fallFrames);
		savedYMotion = yMotion;
		fallFrames++;
		
		// Use the X-motion right before the character got airborne
		xMotion = savedXMotion;
	}
			
	controller.Move(Vector3(xMotion * Time.deltaTime, yMotion * Time.deltaTime, 0));
	
}
