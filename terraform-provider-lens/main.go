package main

import (
	"github.com/hashicorp/terraform-plugin-sdk/v2/plugin"
	"github.com/lensapp/terraform-provider-lens/lens"
)

func main() {
	plugin.Serve(&plugin.ServeOpts{
		ProviderFunc: lens.Provider,
	})
}
