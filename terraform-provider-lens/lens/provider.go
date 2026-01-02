package lens

import (
	"context"
	"fmt"

	"github.com/hashicorp/terraform-plugin-sdk/v2/diag"
	"github.com/hashicorp/terraform-plugin-sdk/v2/helper/schema"
)

// Provider -
func Provider() *schema.Provider {
	return &schema.Provider{
		Schema: map[string]*schema.Schema{
			"token": {
				Type:        schema.TypeString,
				Optional:    true,
				DefaultFunc: schema.EnvDefaultFunc("LENS_ACCESS_TOKEN", nil),
				Description: "The access token for Lens API",
				Sensitive:   true,
			},
		},
		ResourcesMap: map[string]*schema.Resource{
			"lens_team_space": resourceTeamSpace(),
		},
		DataSourcesMap: map[string]*schema.Resource{},
		ConfigureContextFunc: providerConfigure,
	}
}

func providerConfigure(ctx context.Context, d *schema.ResourceData) (interface{}, diag.Diagnostics) {
	token := d.Get("token").(string)

	// Warning or error if token is missing
	if token == "" {
		return nil, diag.FromErr(fmt.Errorf("access token must be configured"))
	}

	c, err := NewClient(&token)
	if err != nil {
		return nil, diag.FromErr(err)
	}

	return c, nil
}
