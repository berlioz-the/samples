berlioz-cli login --user ruben --pass Kukareku1234!

# berlioz-cli build
berlioz-cli push
# berlioz-cli  process --deployment prod --region us-east-1 --cluster hello_world --stage single-stage-deploy
# berlioz-cli  process --deployment prod --region us-east-1 --cluster hello_world --stage dev-empty-current,construct-desired
# berlioz-cli  process --deployment prod --region us-east-1 --cluster hello_world --stage extract-current,construct-desired


# berlioz-cli  process --deployment prod --region us-east-1 --cluster hello_world --stage extract-current,construct-desired,output-delta,process-delta 
