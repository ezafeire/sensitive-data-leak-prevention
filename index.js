 /*
 The regular expressions that we're looking for.
 */
 const id_regex = /\w{8}-\w{4}-\w{4}-\w{4}-\w{12}/gm
 const token_regex = /s[.][a-zA-Z0-9]{24}/gm
 
module.exports = app => {
  app.log("Yay, the app was loaded!")
  
  app.on('issues.opened', async context => {   
    reply_text="" // this holds the reply to the user and will also act as a flag to determine whether the post contained sensitive info.
	/*
	Relevant data regarding the post
	*/
	const id_of_issue=context['payload']['issue']['node_id']
	const number_of_issue=context['payload']['issue']['number']
    const body_of_issue= context['payload']['issue']['body']
    const title_of_issue= context['payload']['issue']['title']
    const user_of_issue= context['payload']['sender']['login']
	const repo_full_name= context['payload']['repository']['full_name']
	/*
	This detects the position of the mistakes within the post and constructs the reply to inform the user.
	*/
    if (body_of_issue.search(id_regex)!=-1){
	reply_text=reply_text+"\n"+construct_reply("ROLE-ID/SECRET-ID","BODY")
	}
    if (title_of_issue.search(id_regex)!=-1){
 	reply_text=reply_text+"\n"+construct_reply("ROLE-ID/SECRET-ID","TITLE")
	}
	if (body_of_issue.search(token_regex)!=-1){
 	reply_text=reply_text+"\n"+construct_reply("TOKEN","BODY")
	}
	if (title_of_issue.search(token_regex)!=-1){
 	reply_text=reply_text+"\n"+construct_reply("TOKEN","TITLE")
	}
	var issue_body=body_of_issue
	var issue_title=title_of_issue
	/*
	This handles redacting sensitive information as well as tagging the owner of the original post at the top of the body.
	*/
	issue_body=issue_body.replace(id_regex," [REDACTED] ")
	issue_body="Originally posted by @"+user_of_issue+"\n"+issue_body.replace(token_regex," [REDACTED] ")
	issue_title=issue_title.replace(id_regex," [REDACTED] ")
	issue_title=issue_title.replace(token_regex," [REDACTED] ") + " - REPOSTED BY DLP" 
	issueComment = context.issue({ body: "@"+user_of_issue+"\n"+reply_text + "\nYour post has been deleted and a new one has been created, without sensitive data: \n Title: >"+issue_title+"\n Body: >"+issue_body+"\n\n Next time, please be careful \n Thanks,\n Vault Team"})
	if(reply_text!=""){
		context.github.issues.createComment(issueComment) // informing them of error - will also send e-mail
		delete_issue(context, id_of_issue) // deleting the issue
		create_issue(context,repo_full_name,issue_title,issue_body) // creating a new issue
	}		
	
  })
  
	  function create_issue(context,full_name,titl,bd){
		  full_name=full_name.split('/')
		  contents = context.issue({
			  owner: full_name[0],
			  repo: full_name[1],
			  title: titl,
			  body: bd
		  })
		  context.github.issues.create(contents)
		  return 1
	  }
  
      function delete_issue(context,id){
		const mutate = `mutation deleteIssue($input: DeleteIssueInput!) {
									deleteIssue(input: $input){
											clientMutationId
									}
								}
						`

		const a = context.github.graphql(mutate, {
			"input": {
						"issueId": id
					 }
		})
		  
	}

  
  function construct_reply(what,type){
	 return "I've detected that you've used a "+what+" in your post's "+type+". Keep in mind that role-id, secret-id and tokens are CONFIDENTIAL and must be treated as such." 
  }

}
