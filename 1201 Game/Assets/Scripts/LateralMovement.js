#pragma strict

var moveSpeed : float;
var dt : float;
var forward : Vector3;
var backward : Vector3;

var jumpForce : float;
var jumpDelay : float;

var canJump : boolean;
var onFloor : boolean;
var timeSinceLastJump : float;

var move : Vector3;

var look_left : boolean;
var look_right : boolean;

function Start () {
	moveSpeed = 3.0;
	dt = Time.deltaTime;
	forward = transform.TransformDirection(Vector3.left);
	backward = transform.TransformDirection(Vector3.right);
	
	jumpForce = 5;
	jumpDelay = 1;
	
	canJump = true;
	timeSinceLastJump = 10;
	
}

function Update () {
	timeSinceLastJump += dt;
	
	if (Input.GetKey(KeyCode.LeftArrow)) {
		transform.rotation.y = 180;
		look_left = true;
		look_right = false;
		move = moveSpeed * dt * backward * Input.GetAxis("Horizontal");
		transform.Translate(move);
	}
	else if (Input.GetKey(KeyCode.RightArrow)) {
		transform.rotation.y = 0;
		look_left = false;
		look_right = true;
		move = moveSpeed * dt * forward * Input.GetAxis("Horizontal");
		transform.Translate(move);
	}
	
	if (canJump && Input.GetKeyDown("space")) {
		rigidbody.velocity.y += jumpForce;		
		canJump = false;
		onFloor = false;
		timeSinceLastJump = 0;
	}
	
}

function OnCollisionEnter(collision : Collision) {
	if(collision.gameObject.tag == "floor" || collision.gameObject.tag == "pushpull") {
		onFloor = true;
		canJump = true;
		
	}
}