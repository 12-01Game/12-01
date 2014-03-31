#pragma strict

var PP : PushPull;

function Start () {
	PP = GetComponent(PushPull);
}

function Update () {
	/*if (PP.side == 0) {
		if (PP.pushing) {
			rigidbody.mass = 1;
			rigidbody.AddForce(Vector3.right * 10);
		}
		else if (PP.pulling) {
			rigidbody.mass = 1;
			rigidbody.AddForce(Vector3.left * 10);
		}
	}
	else if (PP.side == 1) {
	
	}*/
}