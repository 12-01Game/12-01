#pragma strict
var moveSpeed : float;
var dt : float;
var forward : Vector3;
var jumpForce : float;
var jumpDelay : float;
var canJump : boolean;
var timeSinceLastJump : float;

function Start () {
	moveSpeed = 3.0;
	dt = Time.deltaTime;
	forward = transform.TransformDirection(Vector3.left);
	//forward = transform.TransformDirection(Vector3.forward);
	
	jumpForce = 5;
	jumpDelay = 1;
	
	canJump = true;
	timeSinceLastJump = 10;
	
}
function Update () {
	timeSinceLastJump += dt;
	
	if (Input.GetAxis("Horizontal")) {
		transform.Translate(moveSpeed * dt * forward * Input.GetAxis("Horizontal"));
	}
	
	if (canJump && Input.GetKeyDown("space")) {
		rigidbody.velocity.y += jumpForce;		
		canJump = false;
		timeSinceLastJump = 0;
	}
	
}
function OnCollisionEnter(collision : Collision) {
	if((collision.gameObject.name=="Floor uved2") && (timeSinceLastJump > jumpDelay)) {
		canJump = true;
	}
}