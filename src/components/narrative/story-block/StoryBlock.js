import React, {useState} from 'react';
import {Container, Grid, Icon, Image, Button} from "semantic-ui-react";

import './StoryBlock.css';
import Sectors from "./graphs/Sectors";
import Gases from "./graphs/Gases";
import PolarIce from "./graphs/PolarIce";
import SeaLevel from "./graphs/SeaLevel";

import earthBad from '../../../img/earth-bad.png';
import greenhouse_gases from '../../../data/narrative/greenhouse_gases.json';
import sectors from '../../../data/narrative/sectors.json';
import text from '../../../data/narrative/text.json';
import sea_level from '../../../data/narrative/sea_level.json';
import polar_ice from '../../../data/narrative/polar_ice.json';


function StoryBlock(props) {

  const [seaIceActive, setSeaIceActive] = useState(0);

  return (
    <div className="story-block">
      { props.story >= 0 &&
        <Grid columns={2}>
          <Grid.Column >
            <h1 className="story-heading" dangerouslySetInnerHTML={{__html: text[props.story].heading}}/>
            {text[props.story].subtext.length > 0 &&
            <p className="story-subtext" dangerouslySetInnerHTML={{__html: text[props.story].subtext}}/>
            }
            {text[props.story].facts.length > 0 &&
            text[props.story].facts.map((fact, index) => (
              <div className="fact" key={index}>
                <Icon className="fact-icon" name={fact.icon} color={fact.icon_color}/>
                <p className="fact-text" dangerouslySetInnerHTML={{__html: fact.text}}/>
              </div>
            ))
            }
          </Grid.Column>
          <Grid.Column>
            { props.story === 0 && // temp and co2
              <Container>
                <Image className="earth-bad" src={earthBad} alt="Red earth" fluid centered/>
              </Container>
            }
            { props.story === 1 && // sea levels and ice caps
              <Container className='ice-sea-container'>
                <Button.Group>
                  <Button className={seaIceActive ? "active" : "primary"} onClick={() => setSeaIceActive(0)}>Sea Level</Button>
                  <Button.Or />
                  <Button className={seaIceActive ? "primary" : "active"} onClick={() => setSeaIceActive(1)}>Ice Caps</Button>
                </Button.Group>
                { seaIceActive
                  ? <PolarIce data={polar_ice} />
                  : <SeaLevel data={sea_level} />
                }
              </Container>
            }
            { props.story === 2 && // how did we get here? -- greenhouse gases
              <Gases data={greenhouse_gases} />
            }
            { props.story === 3 && // why do we focus on co2?
              // <Sheet type="offsets"/>
              <p>INSERT GRAPH</p>
            }
            { props.story === 4 && // how do we stay in budget?
              <Sectors data={sectors} />
            }
            { props.story === 5 && // Paris Climate Accord
              <p>INSERT GRAPH</p>
            }
          </Grid.Column>
        </Grid>
      }
    </div>
  );
}

export default StoryBlock;
