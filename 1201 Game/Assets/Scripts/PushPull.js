#pragma strict

var distance : float;
var object : Transform;
var movement : LateralMovement;
var grab : boolean;

function Start () {
	movement = GetComponent(LateralMovement);
	grab = false;
}

function Update () {
	if (movement.onFloor && (object != null)) {
		distance = Vector3.Distance(this.transform.position, object.position);
		if (Input.GetKeyDown("z")) {
			grab = true;
		}
		if (Input.GetKeyUp("z")) {
			movement.moveSpeed = 3.0;
			grab = false;
		}
		if (grab && (Input.GetAxis("Horizontal"))) {
				movement.moveSpeed = 1.5;
				object.transform.Translate(movement.move);
		}
		/*//player is on the left hand side of the object
		if (grab && (this.transform.position.x < object.position.x)) {
			if(Input.GetKey(KeyCode.RightArrow)) {
				movement.moveSpeed = 1.5;
				object.transform.Translate(movement.move);
			}
			else if(Input.GetKey(KeyCode.LeftArrow)) {
				movement.moveSpeed = 1.5;
				object.transform.Translate(movement.move);
			}
		}
		//player is on the right hand side of the object
		else if (grab && (this.transform.position.x > object.position.x)) {
			if(Input.GetKey(KeyCode.RightArrow)) {
				movement.moveSpeed = 1.5;
				object.transform.Translate(movement.move);
			}
			else if(Input.GetKey(KeyCode.LeftArrow)) {
				movement.moveSpeed = 1.5;
				object.transform.Translate(movement.move);
			}
		}*/
	}
	
}

function OnCollisionEnter(collision : Collision) {
	if(collision.gameObject.tag == "pushpull") {
		object = collision.gameObject.transform;
	}
}

function OnCollisionExit(collision : Collision) {
	if (collision.gameObject.tag == "pushpull") {
		yield WaitForSeconds(0.2);
		object = null;
		grab = false;
		movement.moveSpeed = 3.0;
	}
}
