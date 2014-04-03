@script RequireComponent(CharacterController)

/// Constants
private static var SPEED : float = 6.0;
private static var JUMP_SPEED : float = 8.0;
private static var GRAVITY : float = 20.0;

/// Configurable properties (normalized to 1 using the above constants)
var speed : float = 1;
var jumpSpeed : float = 1;
var gravity : float = 1;
var runFactor : float = 1.5;
var midairRedirect : boolean = true;

/// Hidden variables
private var trajectory : Vector3 = Vector3.zero;
private var direction = 1;

function Update() {
	Debug.Log("Update");

	var controller : CharacterController = GetComponent(CharacterController);
	var modifier : float = -1;

	/// Turn character
	if (midairRedirect || controller.isGrounded) {
		direction = Input.GetAxisRaw("Horizontal");
		if (direction != 0) { 
			transform.eulerAngles.y = direction * 90;
		}
	}	

	/// Apply Run Factor, if Run button is held.
	///if (Input.GetButtonDown("Run")) {
	///	modifier = runFactor;
	///}

	if (controller.isGrounded) { // Recalculate movement from grounded state
		trajectory = Vector3(direction, 0, 0) * speed * SPEED * modifier;
	
		if (Input.GetButton ("Jump")) {
			trajectory.y = jumpSpeed * JUMP_SPEED * modifier;
			Debug.Log("Jump!");
		}
	}
	else if (midairRedirect && direction != 0) { // Recalculate x-movement midair, if enabled
		trajectory.x = direction * speed * SPEED * modifier;
	}

	// Apply gravity
	trajectory.y -= gravity * GRAVITY * Time.deltaTime;
	
	// Move the controller
	controller.Move(trajectory * Time.deltaTime);
}


/// Debug messages for collision detection.
function OnCollisionEnter(collision : Collision) {
	Debug.Log("Hank collision enter");
}

function OnCollisionExit(collision : Collision) {
	Debug.Log("Hank collision exit");
}

function OnTriggernEnter(collision : Collision) {
	Debug.Log("Hank trigger enter");
}

function OnTriggerExit(collision : Collision) {
	Debug.Log("Hank trigger exit");
}