<COPASI xmlns="http://www.copasi.org/static/schema" versionMajor="4" versionMinor="48" versionDevel="311" copasiSourcesModified="0">
  <ListOfFunctions>
    <Function key="Function_81" name="Function for J1" type="UserDefined" reversible="true">
      <MiriamAnnotation>
        <rdf:RDF xmlns:dcterms="http://purl.org/dc/terms/" xmlns:rdf="http://www.w3.org/1999/02/22-rdf-syntax-ns#">
          <rdf:Description rdf:about="#Function_81">
</rdf:Description>
        </rdf:RDF>
      </MiriamAnnotation>
      <Expression>
        (k1*A*cat-kN1*cat1)/default_compartment
      </Expression>
      <ListOfParameterDescriptions>
        <ParameterDescription key="FunctionParameter_671" name="A" order="0" role="substrate"/>
        <ParameterDescription key="FunctionParameter_670" name="cat" order="1" role="substrate"/>
        <ParameterDescription key="FunctionParameter_669" name="cat1" order="2" role="product"/>
        <ParameterDescription key="FunctionParameter_668" name="default_compartment" order="3" role="volume"/>
        <ParameterDescription key="FunctionParameter_678" name="k1" order="4" role="constant"/>
        <ParameterDescription key="FunctionParameter_679" name="kN1" order="5" role="constant"/>
      </ListOfParameterDescriptions>
    </Function>
    <Function key="Function_82" name="Function for J2" type="UserDefined" reversible="true">
      <MiriamAnnotation>
        <rdf:RDF xmlns:dcterms="http://purl.org/dc/terms/" xmlns:rdf="http://www.w3.org/1999/02/22-rdf-syntax-ns#">
          <rdf:Description rdf:about="#Function_82">
</rdf:Description>
        </rdf:RDF>
      </MiriamAnnotation>
      <Expression>
        (k2*cat1*B-kN2*cat2)/default_compartment
      </Expression>
      <ListOfParameterDescriptions>
        <ParameterDescription key="FunctionParameter_686" name="B" order="0" role="substrate"/>
        <ParameterDescription key="FunctionParameter_687" name="cat1" order="1" role="substrate"/>
        <ParameterDescription key="FunctionParameter_688" name="cat2" order="2" role="product"/>
        <ParameterDescription key="FunctionParameter_689" name="default_compartment" order="3" role="volume"/>
        <ParameterDescription key="FunctionParameter_690" name="k2" order="4" role="constant"/>
        <ParameterDescription key="FunctionParameter_691" name="kN2" order="5" role="constant"/>
      </ListOfParameterDescriptions>
    </Function>
    <Function key="Function_83" name="Function for J3" type="UserDefined" reversible="true">
      <MiriamAnnotation>
        <rdf:RDF xmlns:dcterms="http://purl.org/dc/terms/" xmlns:rdf="http://www.w3.org/1999/02/22-rdf-syntax-ns#">
          <rdf:Description rdf:about="#Function_83">
</rdf:Description>
        </rdf:RDF>
      </MiriamAnnotation>
      <Expression>
        (k3*cat2-kN3*P*cat)/default_compartment
      </Expression>
      <ListOfParameterDescriptions>
        <ParameterDescription key="FunctionParameter_698" name="P" order="0" role="product"/>
        <ParameterDescription key="FunctionParameter_699" name="cat" order="1" role="product"/>
        <ParameterDescription key="FunctionParameter_700" name="cat2" order="2" role="substrate"/>
        <ParameterDescription key="FunctionParameter_701" name="default_compartment" order="3" role="volume"/>
        <ParameterDescription key="FunctionParameter_702" name="k3" order="4" role="constant"/>
        <ParameterDescription key="FunctionParameter_703" name="kN3" order="5" role="constant"/>
      </ListOfParameterDescriptions>
    </Function>
    <Function key="Function_84" name="Function for J4" type="UserDefined" reversible="true">
      <MiriamAnnotation>
        <rdf:RDF xmlns:dcterms="http://purl.org/dc/terms/" xmlns:rdf="http://www.w3.org/1999/02/22-rdf-syntax-ns#">
          <rdf:Description rdf:about="#Function_84">
</rdf:Description>
        </rdf:RDF>
      </MiriamAnnotation>
      <Expression>
        (k4*B*cat-kN4*catI)/default_compartment
      </Expression>
      <ListOfParameterDescriptions>
        <ParameterDescription key="FunctionParameter_710" name="B" order="0" role="substrate"/>
        <ParameterDescription key="FunctionParameter_711" name="cat" order="1" role="substrate"/>
        <ParameterDescription key="FunctionParameter_712" name="catI" order="2" role="product"/>
        <ParameterDescription key="FunctionParameter_713" name="default_compartment" order="3" role="volume"/>
        <ParameterDescription key="FunctionParameter_714" name="k4" order="4" role="constant"/>
        <ParameterDescription key="FunctionParameter_715" name="kN4" order="5" role="constant"/>
      </ListOfParameterDescriptions>
    </Function>
  </ListOfFunctions>
  <Model key="Model_1" name="NoName" simulationType="time" timeUnit="s" volumeUnit="l" areaUnit="m&#178;" lengthUnit="m" quantityUnit="mol" type="deterministic" avogadroConstant="6.0221417899999999e+23">
    <MiriamAnnotation>
      <rdf:RDF xmlns:dcterms="http://purl.org/dc/terms/" xmlns:rdf="http://www.w3.org/1999/02/22-rdf-syntax-ns#">
        <rdf:Description rdf:about="#Model_1">
          <dcterms:created>
            <rdf:Description>
              <dcterms:W3CDTF>2026-11-11T18:01:34Z</dcterms:W3CDTF>
            </rdf:Description>
          </dcterms:created>
        </rdf:Description>
      </rdf:RDF>
    </MiriamAnnotation>
    <ListOfCompartments>
      <Compartment key="Compartment_0" name="default_compartment" simulationType="fixed" dimensionality="3" addNoise="false">
        <MiriamAnnotation>
          <rdf:RDF xmlns:CopasiMT="http://www.copasi.org/RDF/MiriamTerms#" xmlns:rdf="http://www.w3.org/1999/02/22-rdf-syntax-ns#">
            <rdf:Description rdf:about="#Compartment_0">
              <CopasiMT:is rdf:resource="urn:miriam:unknown:SBO:0000410"/>
            </rdf:Description>
          </rdf:RDF>
        </MiriamAnnotation>
      </Compartment>
    </ListOfCompartments>
    <ListOfMetabolites>
      <Metabolite key="Metabolite_0" name="A" simulationType="reactions" compartment="Compartment_0" addNoise="false" particle_numbers="0.0">
        <MiriamAnnotation>
          <rdf:RDF xmlns:dcterms="http://purl.org/dc/terms/" xmlns:rdf="http://www.w3.org/1999/02/22-rdf-syntax-ns#">
            <rdf:Description rdf:about="#Metabolite_0">
</rdf:Description>
          </rdf:RDF>
        </MiriamAnnotation>
      </Metabolite>
      <Metabolite key="Metabolite_1" name="cat" simulationType="reactions" compartment="Compartment_0" addNoise="false" particle_numbers="0.0">
        <MiriamAnnotation>
          <rdf:RDF xmlns:dcterms="http://purl.org/dc/terms/" xmlns:rdf="http://www.w3.org/1999/02/22-rdf-syntax-ns#">
            <rdf:Description rdf:about="#Metabolite_1">
</rdf:Description>
          </rdf:RDF>
        </MiriamAnnotation>
      </Metabolite>
      <Metabolite key="Metabolite_2" name="cat1" simulationType="reactions" compartment="Compartment_0" addNoise="false" particle_numbers="0.0">
        <MiriamAnnotation>
          <rdf:RDF xmlns:dcterms="http://purl.org/dc/terms/" xmlns:rdf="http://www.w3.org/1999/02/22-rdf-syntax-ns#">
            <rdf:Description rdf:about="#Metabolite_2">
</rdf:Description>
          </rdf:RDF>
        </MiriamAnnotation>
      </Metabolite>
      <Metabolite key="Metabolite_3" name="B" simulationType="reactions" compartment="Compartment_0" addNoise="false" particle_numbers="0.0">
        <MiriamAnnotation>
          <rdf:RDF xmlns:dcterms="http://purl.org/dc/terms/" xmlns:rdf="http://www.w3.org/1999/02/22-rdf-syntax-ns#">
            <rdf:Description rdf:about="#Metabolite_3">
</rdf:Description>
          </rdf:RDF>
        </MiriamAnnotation>
      </Metabolite>
      <Metabolite key="Metabolite_4" name="cat2" simulationType="reactions" compartment="Compartment_0" addNoise="false" particle_numbers="0.0">
        <MiriamAnnotation>
          <rdf:RDF xmlns:dcterms="http://purl.org/dc/terms/" xmlns:rdf="http://www.w3.org/1999/02/22-rdf-syntax-ns#">
            <rdf:Description rdf:about="#Metabolite_4">
</rdf:Description>
          </rdf:RDF>
        </MiriamAnnotation>
      </Metabolite>
      <Metabolite key="Metabolite_5" name="P" simulationType="reactions" compartment="Compartment_0" addNoise="false" particle_numbers="0.0">
        <MiriamAnnotation>
          <rdf:RDF xmlns:dcterms="http://purl.org/dc/terms/" xmlns:rdf="http://www.w3.org/1999/02/22-rdf-syntax-ns#">
            <rdf:Description rdf:about="#Metabolite_5">
</rdf:Description>
          </rdf:RDF>
        </MiriamAnnotation>
      </Metabolite>
      <Metabolite key="Metabolite_6" name="catI" simulationType="reactions" compartment="Compartment_0" addNoise="false" particle_numbers="0.0">
        <MiriamAnnotation>
          <rdf:RDF xmlns:dcterms="http://purl.org/dc/terms/" xmlns:rdf="http://www.w3.org/1999/02/22-rdf-syntax-ns#">
            <rdf:Description rdf:about="#Metabolite_6">
</rdf:Description>
          </rdf:RDF>
        </MiriamAnnotation>
      </Metabolite>
    </ListOfMetabolites>
    <ListOfModelValues>
      <ModelValue key="ModelValue_0" name="k1" simulationType="fixed" addNoise="false" initial_value="0.0">
        <MiriamAnnotation>
          <rdf:RDF xmlns:dcterms="http://purl.org/dc/terms/" xmlns:rdf="http://www.w3.org/1999/02/22-rdf-syntax-ns#">
            <rdf:Description rdf:about="#ModelValue_0">
</rdf:Description>
          </rdf:RDF>
        </MiriamAnnotation>
      </ModelValue>
      <ModelValue key="ModelValue_1" name="kN1" simulationType="fixed" addNoise="false" initial_value="0.0">
        <MiriamAnnotation>
          <rdf:RDF xmlns:dcterms="http://purl.org/dc/terms/" xmlns:rdf="http://www.w3.org/1999/02/22-rdf-syntax-ns#">
            <rdf:Description rdf:about="#ModelValue_1">
</rdf:Description>
          </rdf:RDF>
        </MiriamAnnotation>
      </ModelValue>
      <ModelValue key="ModelValue_2" name="k2" simulationType="fixed" addNoise="false" initial_value="0.0">
        <MiriamAnnotation>
          <rdf:RDF xmlns:dcterms="http://purl.org/dc/terms/" xmlns:rdf="http://www.w3.org/1999/02/22-rdf-syntax-ns#">
            <rdf:Description rdf:about="#ModelValue_2">
</rdf:Description>
          </rdf:RDF>
        </MiriamAnnotation>
      </ModelValue>
      <ModelValue key="ModelValue_3" name="kN2" simulationType="fixed" addNoise="false" initial_value="0.0">
        <MiriamAnnotation>
          <rdf:RDF xmlns:dcterms="http://purl.org/dc/terms/" xmlns:rdf="http://www.w3.org/1999/02/22-rdf-syntax-ns#">
            <rdf:Description rdf:about="#ModelValue_3">
</rdf:Description>
          </rdf:RDF>
        </MiriamAnnotation>
      </ModelValue>
      <ModelValue key="ModelValue_4" name="k3" simulationType="fixed" addNoise="false" initial_value="0.0">
        <MiriamAnnotation>
          <rdf:RDF xmlns:dcterms="http://purl.org/dc/terms/" xmlns:rdf="http://www.w3.org/1999/02/22-rdf-syntax-ns#">
            <rdf:Description rdf:about="#ModelValue_4">
</rdf:Description>
          </rdf:RDF>
        </MiriamAnnotation>
      </ModelValue>
      <ModelValue key="ModelValue_5" name="kN3" simulationType="fixed" addNoise="false" initial_value="0.0">
        <MiriamAnnotation>
          <rdf:RDF xmlns:dcterms="http://purl.org/dc/terms/" xmlns:rdf="http://www.w3.org/1999/02/22-rdf-syntax-ns#">
            <rdf:Description rdf:about="#ModelValue_5">
</rdf:Description>
          </rdf:RDF>
        </MiriamAnnotation>
      </ModelValue>
      <ModelValue key="ModelValue_6" name="k4" simulationType="fixed" addNoise="false" initial_value="0.0">
        <MiriamAnnotation>
          <rdf:RDF xmlns:dcterms="http://purl.org/dc/terms/" xmlns:rdf="http://www.w3.org/1999/02/22-rdf-syntax-ns#">
            <rdf:Description rdf:about="#ModelValue_6">
</rdf:Description>
          </rdf:RDF>
        </MiriamAnnotation>
      </ModelValue>
      <ModelValue key="ModelValue_7" name="kN4" simulationType="fixed" addNoise="false" initial_value="0.0">
        <MiriamAnnotation>
          <rdf:RDF xmlns:dcterms="http://purl.org/dc/terms/" xmlns:rdf="http://www.w3.org/1999/02/22-rdf-syntax-ns#">
            <rdf:Description rdf:about="#ModelValue_7">
</rdf:Description>
          </rdf:RDF>
        </MiriamAnnotation>
      </ModelValue>
      <ModelValue key="ModelValue_8" name="event_1" simulationType="fixed" addNoise="false" initial_value="0.0">
        <MiriamAnnotation>
          <rdf:RDF xmlns:dcterms="http://purl.org/dc/terms/" xmlns:rdf="http://www.w3.org/1999/02/22-rdf-syntax-ns#">
            <rdf:Description rdf:about="#ModelValue_8">
</rdf:Description>
          </rdf:RDF>
        </MiriamAnnotation>
      </ModelValue>
      <ModelValue key="ModelValue_9" name="rct_vol1" simulationType="fixed" addNoise="false" initial_value="30.0">
        <MiriamAnnotation>
          <rdf:RDF xmlns:dcterms="http://purl.org/dc/terms/" xmlns:rdf="http://www.w3.org/1999/02/22-rdf-syntax-ns#">
            <rdf:Description rdf:about="#ModelValue_9">
</rdf:Description>
          </rdf:RDF>
        </MiriamAnnotation>
      </ModelValue>
      <ModelValue key="ModelValue_10" name="add_vol1" simulationType="fixed" addNoise="false" initial_value="0.5">
        <MiriamAnnotation>
          <rdf:RDF xmlns:dcterms="http://purl.org/dc/terms/" xmlns:rdf="http://www.w3.org/1999/02/22-rdf-syntax-ns#">
            <rdf:Description rdf:about="#ModelValue_10">
</rdf:Description>
          </rdf:RDF>
        </MiriamAnnotation>
      </ModelValue>
      <ModelValue key="ModelValue_11" name="new_vol1" simulationType="fixed" addNoise="false" initial_value="30.5">
        <MiriamAnnotation>
          <rdf:RDF xmlns:dcterms="http://purl.org/dc/terms/" xmlns:rdf="http://www.w3.org/1999/02/22-rdf-syntax-ns#">
            <rdf:Description rdf:about="#ModelValue_11">
</rdf:Description>
          </rdf:RDF>
        </MiriamAnnotation>
        <InitialExpression>
          &lt;CN=Root,Model=NoName,Vector=Values[rct_vol1],Reference=InitialValue&gt;+&lt;CN=Root,Model=NoName,Vector=Values[add_vol1],Reference=InitialValue&gt;
        </InitialExpression>
      </ModelValue>
      <ModelValue key="ModelValue_12" name="ratio1" simulationType="fixed" addNoise="false" initial_value="0.9836065573770492">
        <MiriamAnnotation>
          <rdf:RDF xmlns:dcterms="http://purl.org/dc/terms/" xmlns:rdf="http://www.w3.org/1999/02/22-rdf-syntax-ns#">
            <rdf:Description rdf:about="#ModelValue_12">
</rdf:Description>
          </rdf:RDF>
        </MiriamAnnotation>
        <InitialExpression>
          &lt;CN=Root,Model=NoName,Vector=Values[rct_vol1],Reference=InitialValue&gt;/&lt;CN=Root,Model=NoName,Vector=Values[new_vol1],Reference=InitialValue&gt;
        </InitialExpression>
      </ModelValue>
      <ModelValue key="ModelValue_13" name="A_added_mmol_1" simulationType="fixed" addNoise="false" initial_value="1.5">
        <MiriamAnnotation>
          <rdf:RDF xmlns:dcterms="http://purl.org/dc/terms/" xmlns:rdf="http://www.w3.org/1999/02/22-rdf-syntax-ns#">
            <rdf:Description rdf:about="#ModelValue_13">
</rdf:Description>
          </rdf:RDF>
        </MiriamAnnotation>
      </ModelValue>
      <ModelValue key="ModelValue_14" name="rct_vol2" simulationType="fixed" addNoise="false" initial_value="30.5">
        <MiriamAnnotation>
          <rdf:RDF xmlns:dcterms="http://purl.org/dc/terms/" xmlns:rdf="http://www.w3.org/1999/02/22-rdf-syntax-ns#">
            <rdf:Description rdf:about="#ModelValue_14">
</rdf:Description>
          </rdf:RDF>
        </MiriamAnnotation>
      </ModelValue>
      <ModelValue key="ModelValue_15" name="add_vol2" simulationType="fixed" addNoise="false" initial_value="0.8">
        <MiriamAnnotation>
          <rdf:RDF xmlns:dcterms="http://purl.org/dc/terms/" xmlns:rdf="http://www.w3.org/1999/02/22-rdf-syntax-ns#">
            <rdf:Description rdf:about="#ModelValue_15">
</rdf:Description>
          </rdf:RDF>
        </MiriamAnnotation>
      </ModelValue>
      <ModelValue key="ModelValue_16" name="new_vol2" simulationType="fixed" addNoise="false" initial_value="31.3">
        <MiriamAnnotation>
          <rdf:RDF xmlns:dcterms="http://purl.org/dc/terms/" xmlns:rdf="http://www.w3.org/1999/02/22-rdf-syntax-ns#">
            <rdf:Description rdf:about="#ModelValue_16">
</rdf:Description>
          </rdf:RDF>
        </MiriamAnnotation>
        <InitialExpression>
          &lt;CN=Root,Model=NoName,Vector=Values[rct_vol2],Reference=InitialValue&gt;+&lt;CN=Root,Model=NoName,Vector=Values[add_vol2],Reference=InitialValue&gt;
        </InitialExpression>
      </ModelValue>
      <ModelValue key="ModelValue_17" name="ratio2" simulationType="fixed" addNoise="false" initial_value="0.9744408945686901">
        <MiriamAnnotation>
          <rdf:RDF xmlns:dcterms="http://purl.org/dc/terms/" xmlns:rdf="http://www.w3.org/1999/02/22-rdf-syntax-ns#">
            <rdf:Description rdf:about="#ModelValue_17">
</rdf:Description>
          </rdf:RDF>
        </MiriamAnnotation>
        <InitialExpression>
          &lt;CN=Root,Model=NoName,Vector=Values[rct_vol2],Reference=InitialValue&gt;/&lt;CN=Root,Model=NoName,Vector=Values[new_vol2],Reference=InitialValue&gt;
        </InitialExpression>
      </ModelValue>
      <ModelValue key="ModelValue_18" name="cat_added_mmol_2" simulationType="fixed" addNoise="false" initial_value="0.06">
        <MiriamAnnotation>
          <rdf:RDF xmlns:dcterms="http://purl.org/dc/terms/" xmlns:rdf="http://www.w3.org/1999/02/22-rdf-syntax-ns#">
            <rdf:Description rdf:about="#ModelValue_18">
</rdf:Description>
          </rdf:RDF>
        </MiriamAnnotation>
      </ModelValue>
      <ModelValue key="ModelValue_19" name="A_added_mmol_2" simulationType="fixed" addNoise="false" initial_value="1.0">
        <MiriamAnnotation>
          <rdf:RDF xmlns:dcterms="http://purl.org/dc/terms/" xmlns:rdf="http://www.w3.org/1999/02/22-rdf-syntax-ns#">
            <rdf:Description rdf:about="#ModelValue_19">
</rdf:Description>
          </rdf:RDF>
        </MiriamAnnotation>
      </ModelValue>
    </ListOfModelValues>
    <ListOfReactions>
      <Reaction key="Reaction_0" name="J1" reversible="true" fast="false" addNoise="false">
        <MiriamAnnotation>
          <rdf:RDF xmlns:dcterms="http://purl.org/dc/terms/" xmlns:rdf="http://www.w3.org/1999/02/22-rdf-syntax-ns#">
            <rdf:Description rdf:about="#Reaction_0">
</rdf:Description>
          </rdf:RDF>
        </MiriamAnnotation>
        <ListOfSubstrates>
          <Substrate metabolite="Metabolite_0" stoichiometry="1"/>
          <Substrate metabolite="Metabolite_1" stoichiometry="1"/>
        </ListOfSubstrates>
        <ListOfProducts>
          <Product metabolite="Metabolite_2" stoichiometry="1"/>
        </ListOfProducts>
        <ListOfConstants>
          <Constant key="Parameter_0" name="k1" value="1"/>
          <Constant key="Parameter_1" name="kN1" value="1"/>
        </ListOfConstants>
        <KineticLaw function="Function_81" unitType="Default" scalingCompartment="CN=Root,Model=NoName,Vector=Compartments[default_compartment]">
          <ListOfCallParameters>
            <CallParameter functionParameter="FunctionParameter_671">
              <SourceParameter reference="Metabolite_0"/>
            </CallParameter>
            <CallParameter functionParameter="FunctionParameter_670">
              <SourceParameter reference="Metabolite_1"/>
            </CallParameter>
            <CallParameter functionParameter="FunctionParameter_669">
              <SourceParameter reference="Metabolite_2"/>
            </CallParameter>
            <CallParameter functionParameter="FunctionParameter_668">
              <SourceParameter reference="Compartment_0"/>
            </CallParameter>
            <CallParameter functionParameter="FunctionParameter_678">
              <SourceParameter reference="ModelValue_0"/>
            </CallParameter>
            <CallParameter functionParameter="FunctionParameter_679">
              <SourceParameter reference="ModelValue_1"/>
            </CallParameter>
          </ListOfCallParameters>
        </KineticLaw>
      </Reaction>
      <Reaction key="Reaction_1" name="J2" reversible="true" fast="false" addNoise="false">
        <MiriamAnnotation>
          <rdf:RDF xmlns:dcterms="http://purl.org/dc/terms/" xmlns:rdf="http://www.w3.org/1999/02/22-rdf-syntax-ns#">
            <rdf:Description rdf:about="#Reaction_1">
</rdf:Description>
          </rdf:RDF>
        </MiriamAnnotation>
        <ListOfSubstrates>
          <Substrate metabolite="Metabolite_2" stoichiometry="1"/>
          <Substrate metabolite="Metabolite_3" stoichiometry="1"/>
        </ListOfSubstrates>
        <ListOfProducts>
          <Product metabolite="Metabolite_4" stoichiometry="1"/>
        </ListOfProducts>
        <ListOfConstants>
          <Constant key="Parameter_2" name="k2" value="1"/>
          <Constant key="Parameter_3" name="kN2" value="1"/>
        </ListOfConstants>
        <KineticLaw function="Function_82" unitType="Default" scalingCompartment="CN=Root,Model=NoName,Vector=Compartments[default_compartment]">
          <ListOfCallParameters>
            <CallParameter functionParameter="FunctionParameter_686">
              <SourceParameter reference="Metabolite_3"/>
            </CallParameter>
            <CallParameter functionParameter="FunctionParameter_687">
              <SourceParameter reference="Metabolite_2"/>
            </CallParameter>
            <CallParameter functionParameter="FunctionParameter_688">
              <SourceParameter reference="Metabolite_4"/>
            </CallParameter>
            <CallParameter functionParameter="FunctionParameter_689">
              <SourceParameter reference="Compartment_0"/>
            </CallParameter>
            <CallParameter functionParameter="FunctionParameter_690">
              <SourceParameter reference="ModelValue_2"/>
            </CallParameter>
            <CallParameter functionParameter="FunctionParameter_691">
              <SourceParameter reference="ModelValue_3"/>
            </CallParameter>
          </ListOfCallParameters>
        </KineticLaw>
      </Reaction>
      <Reaction key="Reaction_2" name="J3" reversible="true" fast="false" addNoise="false">
        <MiriamAnnotation>
          <rdf:RDF xmlns:dcterms="http://purl.org/dc/terms/" xmlns:rdf="http://www.w3.org/1999/02/22-rdf-syntax-ns#">
            <rdf:Description rdf:about="#Reaction_2">
</rdf:Description>
          </rdf:RDF>
        </MiriamAnnotation>
        <ListOfSubstrates>
          <Substrate metabolite="Metabolite_4" stoichiometry="1"/>
        </ListOfSubstrates>
        <ListOfProducts>
          <Product metabolite="Metabolite_5" stoichiometry="1"/>
          <Product metabolite="Metabolite_1" stoichiometry="1"/>
        </ListOfProducts>
        <ListOfConstants>
          <Constant key="Parameter_4" name="k3" value="1"/>
          <Constant key="Parameter_5" name="kN3" value="1"/>
        </ListOfConstants>
        <KineticLaw function="Function_83" unitType="Default" scalingCompartment="CN=Root,Model=NoName,Vector=Compartments[default_compartment]">
          <ListOfCallParameters>
            <CallParameter functionParameter="FunctionParameter_698">
              <SourceParameter reference="Metabolite_5"/>
            </CallParameter>
            <CallParameter functionParameter="FunctionParameter_699">
              <SourceParameter reference="Metabolite_1"/>
            </CallParameter>
            <CallParameter functionParameter="FunctionParameter_700">
              <SourceParameter reference="Metabolite_4"/>
            </CallParameter>
            <CallParameter functionParameter="FunctionParameter_701">
              <SourceParameter reference="Compartment_0"/>
            </CallParameter>
            <CallParameter functionParameter="FunctionParameter_702">
              <SourceParameter reference="ModelValue_4"/>
            </CallParameter>
            <CallParameter functionParameter="FunctionParameter_703">
              <SourceParameter reference="ModelValue_5"/>
            </CallParameter>
          </ListOfCallParameters>
        </KineticLaw>
      </Reaction>
      <Reaction key="Reaction_3" name="J4" reversible="true" fast="false" addNoise="false">
        <MiriamAnnotation>
          <rdf:RDF xmlns:dcterms="http://purl.org/dc/terms/" xmlns:rdf="http://www.w3.org/1999/02/22-rdf-syntax-ns#">
            <rdf:Description rdf:about="#Reaction_3">
</rdf:Description>
          </rdf:RDF>
        </MiriamAnnotation>
        <ListOfSubstrates>
          <Substrate metabolite="Metabolite_3" stoichiometry="1"/>
          <Substrate metabolite="Metabolite_1" stoichiometry="1"/>
        </ListOfSubstrates>
        <ListOfProducts>
          <Product metabolite="Metabolite_6" stoichiometry="1"/>
        </ListOfProducts>
        <ListOfConstants>
          <Constant key="Parameter_6" name="k4" value="1"/>
          <Constant key="Parameter_7" name="kN4" value="1"/>
        </ListOfConstants>
        <KineticLaw function="Function_84" unitType="Default" scalingCompartment="CN=Root,Model=NoName,Vector=Compartments[default_compartment]">
          <ListOfCallParameters>
            <CallParameter functionParameter="FunctionParameter_710">
              <SourceParameter reference="Metabolite_3"/>
            </CallParameter>
            <CallParameter functionParameter="FunctionParameter_711">
              <SourceParameter reference="Metabolite_1"/>
            </CallParameter>
            <CallParameter functionParameter="FunctionParameter_712">
              <SourceParameter reference="Metabolite_6"/>
            </CallParameter>
            <CallParameter functionParameter="FunctionParameter_713">
              <SourceParameter reference="Compartment_0"/>
            </CallParameter>
            <CallParameter functionParameter="FunctionParameter_714">
              <SourceParameter reference="ModelValue_6"/>
            </CallParameter>
            <CallParameter functionParameter="FunctionParameter_715">
              <SourceParameter reference="ModelValue_7"/>
            </CallParameter>
          </ListOfCallParameters>
        </KineticLaw>
      </Reaction>
    </ListOfReactions>
    <ListOfEvents>
      <Event key="Event_0" name="_E0" fireAtInitialTime="0" persistentTrigger="1">
        <MiriamAnnotation>
          <rdf:RDF xmlns:dcterms="http://purl.org/dc/terms/" xmlns:rdf="http://www.w3.org/1999/02/22-rdf-syntax-ns#">
            <rdf:Description rdf:about="#Event_0">
</rdf:Description>
          </rdf:RDF>
        </MiriamAnnotation>
        <TriggerExpression>
          &lt;CN=Root,Model=NoName,Reference=Time&gt; ge 60 and &lt;CN=Root,Model=NoName,Vector=Values[event_1],Reference=Value&gt; eq 1
        </TriggerExpression>
        <ListOfAssignments>
          <Assignment target="CN=Root,Model=NoName,Vector=Compartments[default_compartment],Vector=Metabolites[A]">
            <Expression>
              (&lt;CN=Root,Model=NoName,Vector=Compartments[default_compartment],Vector=Metabolites[A],Reference=Concentration&gt;*&lt;CN=Root,Model=NoName,Vector=Values[rct_vol1],Reference=Value&gt;+&lt;CN=Root,Model=NoName,Vector=Values[A_added_mmol_1],Reference=Value&gt;)/&lt;CN=Root,Model=NoName,Vector=Values[new_vol1],Reference=Value&gt;
            </Expression>
          </Assignment>
          <Assignment target="CN=Root,Model=NoName,Vector=Compartments[default_compartment],Vector=Metabolites[B]">
            <Expression>
              &lt;CN=Root,Model=NoName,Vector=Compartments[default_compartment],Vector=Metabolites[B],Reference=Concentration&gt;*&lt;CN=Root,Model=NoName,Vector=Values[ratio1],Reference=Value&gt;
            </Expression>
          </Assignment>
          <Assignment target="CN=Root,Model=NoName,Vector=Compartments[default_compartment],Vector=Metabolites[P]">
            <Expression>
              &lt;CN=Root,Model=NoName,Vector=Compartments[default_compartment],Vector=Metabolites[P],Reference=Concentration&gt;*&lt;CN=Root,Model=NoName,Vector=Values[ratio1],Reference=Value&gt;
            </Expression>
          </Assignment>
          <Assignment target="CN=Root,Model=NoName,Vector=Compartments[default_compartment],Vector=Metabolites[cat]">
            <Expression>
              &lt;CN=Root,Model=NoName,Vector=Compartments[default_compartment],Vector=Metabolites[cat],Reference=Concentration&gt;*&lt;CN=Root,Model=NoName,Vector=Values[ratio1],Reference=Value&gt;
            </Expression>
          </Assignment>
          <Assignment target="CN=Root,Model=NoName,Vector=Compartments[default_compartment],Vector=Metabolites[cat1]">
            <Expression>
              &lt;CN=Root,Model=NoName,Vector=Compartments[default_compartment],Vector=Metabolites[cat1],Reference=Concentration&gt;*&lt;CN=Root,Model=NoName,Vector=Values[ratio1],Reference=Value&gt;
            </Expression>
          </Assignment>
          <Assignment target="CN=Root,Model=NoName,Vector=Compartments[default_compartment],Vector=Metabolites[cat2]">
            <Expression>
              &lt;CN=Root,Model=NoName,Vector=Compartments[default_compartment],Vector=Metabolites[cat2],Reference=Concentration&gt;*&lt;CN=Root,Model=NoName,Vector=Values[ratio1],Reference=Value&gt;
            </Expression>
          </Assignment>
          <Assignment target="CN=Root,Model=NoName,Vector=Compartments[default_compartment],Vector=Metabolites[catI]">
            <Expression>
              &lt;CN=Root,Model=NoName,Vector=Compartments[default_compartment],Vector=Metabolites[catI],Reference=Concentration&gt;*&lt;CN=Root,Model=NoName,Vector=Values[ratio1],Reference=Value&gt;
            </Expression>
          </Assignment>
        </ListOfAssignments>
      </Event>
      <Event key="Event_1" name="_E1" fireAtInitialTime="0" persistentTrigger="1">
        <MiriamAnnotation>
          <rdf:RDF xmlns:dcterms="http://purl.org/dc/terms/" xmlns:rdf="http://www.w3.org/1999/02/22-rdf-syntax-ns#">
            <rdf:Description rdf:about="#Event_1">
</rdf:Description>
          </rdf:RDF>
        </MiriamAnnotation>
        <TriggerExpression>
          &lt;CN=Root,Model=NoName,Reference=Time&gt; ge 111 and &lt;CN=Root,Model=NoName,Vector=Values[event_1],Reference=Value&gt; eq 1
        </TriggerExpression>
        <ListOfAssignments>
          <Assignment target="CN=Root,Model=NoName,Vector=Compartments[default_compartment],Vector=Metabolites[A]">
            <Expression>
              (&lt;CN=Root,Model=NoName,Vector=Compartments[default_compartment],Vector=Metabolites[A],Reference=Concentration&gt;*&lt;CN=Root,Model=NoName,Vector=Values[rct_vol2],Reference=Value&gt;+&lt;CN=Root,Model=NoName,Vector=Values[A_added_mmol_2],Reference=Value&gt;)/&lt;CN=Root,Model=NoName,Vector=Values[new_vol2],Reference=Value&gt;
            </Expression>
          </Assignment>
          <Assignment target="CN=Root,Model=NoName,Vector=Compartments[default_compartment],Vector=Metabolites[B]">
            <Expression>
              &lt;CN=Root,Model=NoName,Vector=Compartments[default_compartment],Vector=Metabolites[B],Reference=Concentration&gt;*&lt;CN=Root,Model=NoName,Vector=Values[ratio2],Reference=Value&gt;
            </Expression>
          </Assignment>
          <Assignment target="CN=Root,Model=NoName,Vector=Compartments[default_compartment],Vector=Metabolites[P]">
            <Expression>
              &lt;CN=Root,Model=NoName,Vector=Compartments[default_compartment],Vector=Metabolites[P],Reference=Concentration&gt;*&lt;CN=Root,Model=NoName,Vector=Values[ratio2],Reference=Value&gt;
            </Expression>
          </Assignment>
          <Assignment target="CN=Root,Model=NoName,Vector=Compartments[default_compartment],Vector=Metabolites[cat]">
            <Expression>
              (&lt;CN=Root,Model=NoName,Vector=Compartments[default_compartment],Vector=Metabolites[cat],Reference=Concentration&gt;*&lt;CN=Root,Model=NoName,Vector=Values[rct_vol2],Reference=Value&gt;+&lt;CN=Root,Model=NoName,Vector=Values[cat_added_mmol_2],Reference=Value&gt;)/&lt;CN=Root,Model=NoName,Vector=Values[new_vol2],Reference=Value&gt;
            </Expression>
          </Assignment>
          <Assignment target="CN=Root,Model=NoName,Vector=Compartments[default_compartment],Vector=Metabolites[cat1]">
            <Expression>
              &lt;CN=Root,Model=NoName,Vector=Compartments[default_compartment],Vector=Metabolites[cat1],Reference=Concentration&gt;*&lt;CN=Root,Model=NoName,Vector=Values[ratio2],Reference=Value&gt;
            </Expression>
          </Assignment>
          <Assignment target="CN=Root,Model=NoName,Vector=Compartments[default_compartment],Vector=Metabolites[cat2]">
            <Expression>
              &lt;CN=Root,Model=NoName,Vector=Compartments[default_compartment],Vector=Metabolites[cat2],Reference=Concentration&gt;*&lt;CN=Root,Model=NoName,Vector=Values[ratio2],Reference=Value&gt;
            </Expression>
          </Assignment>
          <Assignment target="CN=Root,Model=NoName,Vector=Compartments[default_compartment],Vector=Metabolites[catI]">
            <Expression>
              &lt;CN=Root,Model=NoName,Vector=Compartments[default_compartment],Vector=Metabolites[catI],Reference=Concentration&gt;*&lt;CN=Root,Model=NoName,Vector=Values[ratio2],Reference=Value&gt;
            </Expression>
          </Assignment>
        </ListOfAssignments>
      </Event>
    </ListOfEvents>
    <ListOfModelParameterSets activeSet="ModelParameterSet_1">
      <ModelParameterSet key="ModelParameterSet_1" name="Initial State">
        <MiriamAnnotation>
          <rdf:RDF xmlns:dcterms="http://purl.org/dc/terms/" xmlns:rdf="http://www.w3.org/1999/02/22-rdf-syntax-ns#">
            <rdf:Description rdf:about="#ModelParameterSet_1">
</rdf:Description>
          </rdf:RDF>
        </MiriamAnnotation>
        <ModelParameterGroup cn="String=Initial Time" type="Group">
          <ModelParameter cn="CN=Root,Model=NoName" value="0" type="Model" simulationType="time"/>
        </ModelParameterGroup>
        <ModelParameterGroup cn="String=Initial Compartment Sizes" type="Group">
          <ModelParameter cn="CN=Root,Model=NoName,Vector=Compartments[default_compartment]" value="1" type="Compartment" simulationType="fixed"/>
        </ModelParameterGroup>
        <ModelParameterGroup cn="String=Initial Species Values" type="Group">
          <ModelParameter cn="CN=Root,Model=NoName,Vector=Compartments[default_compartment],Vector=Metabolites[A]" value="0" type="Species" simulationType="reactions"/>
          <ModelParameter cn="CN=Root,Model=NoName,Vector=Compartments[default_compartment],Vector=Metabolites[cat]" value="0" type="Species" simulationType="reactions"/>
          <ModelParameter cn="CN=Root,Model=NoName,Vector=Compartments[default_compartment],Vector=Metabolites[cat1]" value="0" type="Species" simulationType="reactions"/>
          <ModelParameter cn="CN=Root,Model=NoName,Vector=Compartments[default_compartment],Vector=Metabolites[B]" value="0" type="Species" simulationType="reactions"/>
          <ModelParameter cn="CN=Root,Model=NoName,Vector=Compartments[default_compartment],Vector=Metabolites[cat2]" value="0" type="Species" simulationType="reactions"/>
          <ModelParameter cn="CN=Root,Model=NoName,Vector=Compartments[default_compartment],Vector=Metabolites[P]" value="0" type="Species" simulationType="reactions"/>
          <ModelParameter cn="CN=Root,Model=NoName,Vector=Compartments[default_compartment],Vector=Metabolites[catI]" value="0" type="Species" simulationType="reactions"/>
        </ModelParameterGroup>
        <ModelParameterGroup cn="String=Initial Global Quantities" type="Group">
          <ModelParameter cn="CN=Root,Model=NoName,Vector=Values[k1]" value="0" type="ModelValue" simulationType="fixed"/>
          <ModelParameter cn="CN=Root,Model=NoName,Vector=Values[kN1]" value="0" type="ModelValue" simulationType="fixed"/>
          <ModelParameter cn="CN=Root,Model=NoName,Vector=Values[k2]" value="0" type="ModelValue" simulationType="fixed"/>
          <ModelParameter cn="CN=Root,Model=NoName,Vector=Values[kN2]" value="0" type="ModelValue" simulationType="fixed"/>
          <ModelParameter cn="CN=Root,Model=NoName,Vector=Values[k3]" value="0" type="ModelValue" simulationType="fixed"/>
          <ModelParameter cn="CN=Root,Model=NoName,Vector=Values[kN3]" value="0" type="ModelValue" simulationType="fixed"/>
          <ModelParameter cn="CN=Root,Model=NoName,Vector=Values[k4]" value="0" type="ModelValue" simulationType="fixed"/>
          <ModelParameter cn="CN=Root,Model=NoName,Vector=Values[kN4]" value="0" type="ModelValue" simulationType="fixed"/>
          <ModelParameter cn="CN=Root,Model=NoName,Vector=Values[event_1]" value="0" type="ModelValue" simulationType="fixed"/>
          <ModelParameter cn="CN=Root,Model=NoName,Vector=Values[rct_vol1]" value="30" type="ModelValue" simulationType="fixed"/>
          <ModelParameter cn="CN=Root,Model=NoName,Vector=Values[add_vol1]" value="0.5" type="ModelValue" simulationType="fixed"/>
          <ModelParameter cn="CN=Root,Model=NoName,Vector=Values[new_vol1]" value="30.5" type="ModelValue" simulationType="fixed">
            <InitialExpression>
              &lt;CN=Root,Model=NoName,Vector=Values[rct_vol1],Reference=InitialValue&gt;+&lt;CN=Root,Model=NoName,Vector=Values[add_vol1],Reference=InitialValue&gt;
            </InitialExpression>
          </ModelParameter>
          <ModelParameter cn="CN=Root,Model=NoName,Vector=Values[ratio1]" value="0.98360655737704916" type="ModelValue" simulationType="fixed">
            <InitialExpression>
              &lt;CN=Root,Model=NoName,Vector=Values[rct_vol1],Reference=InitialValue&gt;/&lt;CN=Root,Model=NoName,Vector=Values[new_vol1],Reference=InitialValue&gt;
            </InitialExpression>
          </ModelParameter>
          <ModelParameter cn="CN=Root,Model=NoName,Vector=Values[A_added_mmol_1]" value="1.5" type="ModelValue" simulationType="fixed"/>
          <ModelParameter cn="CN=Root,Model=NoName,Vector=Values[rct_vol2]" value="30.5" type="ModelValue" simulationType="fixed"/>
          <ModelParameter cn="CN=Root,Model=NoName,Vector=Values[add_vol2]" value="0.80000000000000004" type="ModelValue" simulationType="fixed"/>
          <ModelParameter cn="CN=Root,Model=NoName,Vector=Values[new_vol2]" value="31.300000000000001" type="ModelValue" simulationType="fixed">
            <InitialExpression>
              &lt;CN=Root,Model=NoName,Vector=Values[rct_vol2],Reference=InitialValue&gt;+&lt;CN=Root,Model=NoName,Vector=Values[add_vol2],Reference=InitialValue&gt;
            </InitialExpression>
          </ModelParameter>
          <ModelParameter cn="CN=Root,Model=NoName,Vector=Values[ratio2]" value="0.9744408945686901" type="ModelValue" simulationType="fixed">
            <InitialExpression>
              &lt;CN=Root,Model=NoName,Vector=Values[rct_vol2],Reference=InitialValue&gt;/&lt;CN=Root,Model=NoName,Vector=Values[new_vol2],Reference=InitialValue&gt;
            </InitialExpression>
          </ModelParameter>
          <ModelParameter cn="CN=Root,Model=NoName,Vector=Values[cat_added_mmol_2]" value="0.059999999999999998" type="ModelValue" simulationType="fixed"/>
          <ModelParameter cn="CN=Root,Model=NoName,Vector=Values[A_added_mmol_2]" value="1" type="ModelValue" simulationType="fixed"/>
        </ModelParameterGroup>
        <ModelParameterGroup cn="String=Kinetic Parameters" type="Group">
          <ModelParameterGroup cn="CN=Root,Model=NoName,Vector=Reactions[J1]" type="Reaction">
            <ModelParameter cn="CN=Root,Model=NoName,Vector=Reactions[J1],ParameterGroup=Parameters,Parameter=k1" value="0" type="ReactionParameter" simulationType="assignment">
              <InitialExpression>
                &lt;CN=Root,Model=NoName,Vector=Values[k1],Reference=InitialValue&gt;
              </InitialExpression>
            </ModelParameter>
            <ModelParameter cn="CN=Root,Model=NoName,Vector=Reactions[J1],ParameterGroup=Parameters,Parameter=kN1" value="0" type="ReactionParameter" simulationType="assignment">
              <InitialExpression>
                &lt;CN=Root,Model=NoName,Vector=Values[kN1],Reference=InitialValue&gt;
              </InitialExpression>
            </ModelParameter>
          </ModelParameterGroup>
          <ModelParameterGroup cn="CN=Root,Model=NoName,Vector=Reactions[J2]" type="Reaction">
            <ModelParameter cn="CN=Root,Model=NoName,Vector=Reactions[J2],ParameterGroup=Parameters,Parameter=k2" value="0" type="ReactionParameter" simulationType="assignment">
              <InitialExpression>
                &lt;CN=Root,Model=NoName,Vector=Values[k2],Reference=InitialValue&gt;
              </InitialExpression>
            </ModelParameter>
            <ModelParameter cn="CN=Root,Model=NoName,Vector=Reactions[J2],ParameterGroup=Parameters,Parameter=kN2" value="0" type="ReactionParameter" simulationType="assignment">
              <InitialExpression>
                &lt;CN=Root,Model=NoName,Vector=Values[kN2],Reference=InitialValue&gt;
              </InitialExpression>
            </ModelParameter>
          </ModelParameterGroup>
          <ModelParameterGroup cn="CN=Root,Model=NoName,Vector=Reactions[J3]" type="Reaction">
            <ModelParameter cn="CN=Root,Model=NoName,Vector=Reactions[J3],ParameterGroup=Parameters,Parameter=k3" value="0" type="ReactionParameter" simulationType="assignment">
              <InitialExpression>
                &lt;CN=Root,Model=NoName,Vector=Values[k3],Reference=InitialValue&gt;
              </InitialExpression>
            </ModelParameter>
            <ModelParameter cn="CN=Root,Model=NoName,Vector=Reactions[J3],ParameterGroup=Parameters,Parameter=kN3" value="0" type="ReactionParameter" simulationType="assignment">
              <InitialExpression>
                &lt;CN=Root,Model=NoName,Vector=Values[kN3],Reference=InitialValue&gt;
              </InitialExpression>
            </ModelParameter>
          </ModelParameterGroup>
          <ModelParameterGroup cn="CN=Root,Model=NoName,Vector=Reactions[J4]" type="Reaction">
            <ModelParameter cn="CN=Root,Model=NoName,Vector=Reactions[J4],ParameterGroup=Parameters,Parameter=k4" value="0" type="ReactionParameter" simulationType="assignment">
              <InitialExpression>
                &lt;CN=Root,Model=NoName,Vector=Values[k4],Reference=InitialValue&gt;
              </InitialExpression>
            </ModelParameter>
            <ModelParameter cn="CN=Root,Model=NoName,Vector=Reactions[J4],ParameterGroup=Parameters,Parameter=kN4" value="0" type="ReactionParameter" simulationType="assignment">
              <InitialExpression>
                &lt;CN=Root,Model=NoName,Vector=Values[kN4],Reference=InitialValue&gt;
              </InitialExpression>
            </ModelParameter>
          </ModelParameterGroup>
        </ModelParameterGroup>
      </ModelParameterSet>
    </ListOfModelParameterSets>
    <StateTemplate>
      <StateTemplateVariable objectReference="Model_1"/>
      <StateTemplateVariable objectReference="Metabolite_1"/>
      <StateTemplateVariable objectReference="Metabolite_2"/>
      <StateTemplateVariable objectReference="Metabolite_3"/>
      <StateTemplateVariable objectReference="Metabolite_4"/>
      <StateTemplateVariable objectReference="Metabolite_0"/>
      <StateTemplateVariable objectReference="Metabolite_5"/>
      <StateTemplateVariable objectReference="Metabolite_6"/>
      <StateTemplateVariable objectReference="Compartment_0"/>
      <StateTemplateVariable objectReference="ModelValue_0"/>
      <StateTemplateVariable objectReference="ModelValue_1"/>
      <StateTemplateVariable objectReference="ModelValue_2"/>
      <StateTemplateVariable objectReference="ModelValue_3"/>
      <StateTemplateVariable objectReference="ModelValue_4"/>
      <StateTemplateVariable objectReference="ModelValue_5"/>
      <StateTemplateVariable objectReference="ModelValue_6"/>
      <StateTemplateVariable objectReference="ModelValue_7"/>
      <StateTemplateVariable objectReference="ModelValue_8"/>
      <StateTemplateVariable objectReference="ModelValue_9"/>
      <StateTemplateVariable objectReference="ModelValue_10"/>
      <StateTemplateVariable objectReference="ModelValue_11"/>
      <StateTemplateVariable objectReference="ModelValue_12"/>
      <StateTemplateVariable objectReference="ModelValue_13"/>
      <StateTemplateVariable objectReference="ModelValue_14"/>
      <StateTemplateVariable objectReference="ModelValue_15"/>
      <StateTemplateVariable objectReference="ModelValue_16"/>
      <StateTemplateVariable objectReference="ModelValue_17"/>
      <StateTemplateVariable objectReference="ModelValue_18"/>
      <StateTemplateVariable objectReference="ModelValue_19"/>
    </StateTemplate>
    <InitialState type="initialState">
      0 0 0 0 0 0 0 0 1 0 0 0 0 0 0 0 0 0 30 0.5 30.5 0.98360655737704916 1.5 30.5 0.80000000000000004 31.300000000000001 0.9744408945686901 0.059999999999999998 1 
    </InitialState>
  </Model>
  <ListOfTasks>
    <Task key="Task_17" name="Steady-State" type="steadyState" scheduled="false" updateModel="false">
      <Report reference="Report_11" target="" append="1" confirmOverwrite="1"/>
      <Problem>
        <Parameter name="JacobianRequested" type="bool" value="1"/>
        <Parameter name="StabilityAnalysisRequested" type="bool" value="1"/>
      </Problem>
      <Method name="Enhanced Newton" type="EnhancedNewton">
        <Parameter name="Resolution" type="unsignedFloat" value="1.0000000000000001e-09"/>
        <Parameter name="Derivation Factor" type="unsignedFloat" value="0.001"/>
        <Parameter name="Use Newton" type="bool" value="1"/>
        <Parameter name="Use Integration" type="bool" value="1"/>
        <Parameter name="Use Back Integration" type="bool" value="0"/>
        <Parameter name="Accept Negative Concentrations" type="bool" value="0"/>
        <Parameter name="Iteration Limit" type="unsignedInteger" value="50"/>
        <Parameter name="Maximum duration for forward integration" type="unsignedFloat" value="1000000000"/>
        <Parameter name="Maximum duration for backward integration" type="unsignedFloat" value="1000000"/>
        <Parameter name="Target Criterion" type="string" value="Distance and Rate"/>
      </Method>
    </Task>
    <Task key="Task_18" name="Time-Course" type="timeCourse" scheduled="false" updateModel="false">
      <Report reference="Report_12" target="" append="1" confirmOverwrite="1"/>
      <Problem>
        <Parameter name="AutomaticStepSize" type="bool" value="0"/>
        <Parameter name="StepNumber" type="unsignedInteger" value="100"/>
        <Parameter name="StepSize" type="float" value="0.01"/>
        <Parameter name="Duration" type="float" value="1"/>
        <Parameter name="TimeSeriesRequested" type="bool" value="1"/>
        <Parameter name="OutputStartTime" type="float" value="0"/>
        <Parameter name="Output Event" type="bool" value="0"/>
        <Parameter name="Start in Steady State" type="bool" value="0"/>
        <Parameter name="Use Values" type="bool" value="0"/>
        <Parameter name="Values" type="string" value=""/>
      </Problem>
      <Method name="Deterministic (LSODA)" type="Deterministic(LSODA)">
        <Parameter name="Integrate Reduced Model" type="bool" value="0"/>
        <Parameter name="Relative Tolerance" type="unsignedFloat" value="9.9999999999999995e-07"/>
        <Parameter name="Absolute Tolerance" type="unsignedFloat" value="9.9999999999999998e-13"/>
        <Parameter name="Max Internal Steps" type="unsignedInteger" value="100000"/>
        <Parameter name="Max Internal Step Size" type="unsignedFloat" value="0"/>
      </Method>
    </Task>
    <Task key="Task_19" name="Scan" type="scan" scheduled="true" updateModel="0">
      <Report append="0" target="k_values0.txt" reference="Report_96" confirmOverwrite="0"/>
      <Problem>
        <Parameter name="Subtask" type="unsignedInteger" value="5"/>
        <ParameterGroup name="ScanItems">
        <ParameterGroup name="ScanItem"><Parameter type="unsignedInteger" name="Number of steps" value="10"/><Parameter type="unsignedInteger" name="Type" value="0"/><Parameter type="cn" name="Object" value="CN=Root,Model=NoName,Vector=Compartments[default_compartment],Vector=Metabolites[A],Reference=InitialConcentration"/></ParameterGroup></ParameterGroup>
        <Parameter name="Subtask Output" type="string" value="subTaskDuring"/>
        <Parameter name="Adjust initial conditions" type="bool" value="0"/>
        <Parameter name="Continue on Error" type="bool" value="0"/>
      </Problem>
      <Method name="Scan Framework" type="ScanFramework">
      </Method>
    </Task>
    <Task key="Task_20" name="Elementary Flux Modes" type="fluxMode" scheduled="false" updateModel="false">
      <Report reference="Report_13" target="" append="1" confirmOverwrite="1"/>
      <Problem>
      </Problem>
      <Method name="EFM Algorithm" type="EFMAlgorithm">
      </Method>
    </Task>
    <Task key="Task_21" name="Optimization" type="optimization" scheduled="false" updateModel="false">
      <Report reference="Report_14" target="" append="1" confirmOverwrite="1"/>
      <Problem>
        <Parameter name="Subtask" type="cn" value="CN=Root,Vector=TaskList[Steady-State]"/>
        <ParameterText name="ObjectiveExpression" type="expression">
          
        </ParameterText>
        <Parameter name="Maximize" type="bool" value="0"/>
        <Parameter name="Randomize Start Values" type="bool" value="0"/>
        <Parameter name="Calculate Statistics" type="bool" value="1"/>
        <Parameter name="Create Parameter Sets" type="bool" value="0"/>
        <ParameterGroup name="OptimizationItemList">
        </ParameterGroup>
        <ParameterGroup name="OptimizationConstraintList">
        </ParameterGroup>
        <Parameter name="DisplayPopulations" type="bool" value="0"/>
      </Problem>
      <Method name="Random Search" type="RandomSearch">
        <Parameter name="Log Verbosity" type="unsignedInteger" value="0"/>
        <Parameter name="Number of Iterations" type="unsignedInteger" value="100000"/>
        <Parameter name="Random Number Generator" type="unsignedInteger" value="1"/>
        <Parameter name="Seed" type="unsignedInteger" value="0"/>
      </Method>
    </Task>
    <Task key="Task_22" name="Parameter Estimation" type="parameterFitting" scheduled="false" updateModel="0">
      <Report reference="Report_32" target="k_values" append="False" confirmOverwrite="False"/>
      <Problem>
        <Parameter name="Maximize" type="bool" value="0"/>
        <Parameter name="Randomize Start Values" type="bool" value="1"/>
        <Parameter name="Calculate Statistics" type="bool" value="0"/>
        <Parameter name="Create Parameter Sets" type="bool" value="0"/>
        <ParameterGroup name="OptimizationItemList">
          <ParameterGroup name="FitItem">
            <ParameterGroup name="Affected Experiments"/>
            <ParameterGroup name="Affected Cross Validation Experiments"/>
            <Parameter type="cn" name="LowerBound" value="1e-06"/>
            <Parameter type="cn" name="UpperBound" value="1000000"/>
            <Parameter type="float" name="StartValue" value="0.0"/>
            <Parameter type="cn" name="ObjectCN" value="CN=Root,Model=NoName,Vector=Values[k1],Reference=InitialValue"/>
          </ParameterGroup>
          <ParameterGroup name="FitItem">
            <ParameterGroup name="Affected Experiments"/>
            <ParameterGroup name="Affected Cross Validation Experiments"/>
            <Parameter type="cn" name="LowerBound" value="1e-06"/>
            <Parameter type="cn" name="UpperBound" value="1000000"/>
            <Parameter type="float" name="StartValue" value="0.0"/>
            <Parameter type="cn" name="ObjectCN" value="CN=Root,Model=NoName,Vector=Values[k2],Reference=InitialValue"/>
          </ParameterGroup>
          <ParameterGroup name="FitItem">
            <ParameterGroup name="Affected Experiments"/>
            <ParameterGroup name="Affected Cross Validation Experiments"/>
            <Parameter type="cn" name="LowerBound" value="1e-06"/>
            <Parameter type="cn" name="UpperBound" value="1000000"/>
            <Parameter type="float" name="StartValue" value="0.0"/>
            <Parameter type="cn" name="ObjectCN" value="CN=Root,Model=NoName,Vector=Values[k3],Reference=InitialValue"/>
          </ParameterGroup>
          <ParameterGroup name="FitItem">
            <ParameterGroup name="Affected Experiments"/>
            <ParameterGroup name="Affected Cross Validation Experiments"/>
            <Parameter type="cn" name="LowerBound" value="1e-06"/>
            <Parameter type="cn" name="UpperBound" value="1000000"/>
            <Parameter type="float" name="StartValue" value="0.0"/>
            <Parameter type="cn" name="ObjectCN" value="CN=Root,Model=NoName,Vector=Values[k4],Reference=InitialValue"/>
          </ParameterGroup>
          <ParameterGroup name="FitItem">
            <ParameterGroup name="Affected Experiments"/>
            <ParameterGroup name="Affected Cross Validation Experiments"/>
            <Parameter type="cn" name="LowerBound" value="1e-06"/>
            <Parameter type="cn" name="UpperBound" value="1000000"/>
            <Parameter type="float" name="StartValue" value="0.0"/>
            <Parameter type="cn" name="ObjectCN" value="CN=Root,Model=NoName,Vector=Values[kN4],Reference=InitialValue"/>
          </ParameterGroup>
        </ParameterGroup>
        <ParameterGroup name="OptimizationConstraintList">
        </ParameterGroup>
        <Parameter name="DisplayPopulations" type="bool" value="0"/>
        <Parameter name="Steady-State" type="cn" value="CN=Root,Vector=TaskList[Steady-State]"/>
        <Parameter name="Time-Course" type="cn" value="CN=Root,Vector=TaskList[Time-Course]"/>
        <Parameter name="Use Time Sens" type="bool" value="0"/>
        <Parameter name="Time-Sens" type="cn" value=""/>
        <ParameterGroup name="Experiment Set">
          <ParameterGroup name="exp2_data_">
            <Parameter type="key" name="Key" value="Experiment_exp2_data_"/>
            <Parameter type="file" name="File Name" value="copasi_input/exp2_data_.csv"/>
            <Parameter type="bool" name="Data is Row Oriented" value="1"/>
            <Parameter type="unsignedInteger" name="First Row" value="1"/>
            <Parameter type="unsignedInteger" name="Last Row" value="62"/>
            <Parameter type="unsignedInteger" name="Experiment Type" value="1"/>
            <Parameter type="bool" name="Normalize Weights per Experiment" value="1"/>
            <Parameter type="string" name="Separator" value=","/>
            <Parameter type="unsignedInteger" name="Weight Method" value="1"/>
            <Parameter type="unsignedInteger" name="Row containing Names" value="1"/>
            <Parameter type="unsignedInteger" name="Number of Columns" value="9"/>
            <ParameterGroup name="Object Map">
              <ParameterGroup name="0">
                <Parameter type="unsignedInteger" name="Role" value="3"/>
              </ParameterGroup>
              <ParameterGroup name="1">
                <Parameter type="cn" name="Object CN" value="CN=Root,Model=NoName,Vector=Compartments[default_compartment],Vector=Metabolites[A],Reference=Concentration"/>
                <Parameter type="unsignedInteger" name="Role" value="2"/>
              </ParameterGroup>
              <ParameterGroup name="2">
                <Parameter type="cn" name="Object CN" value="CN=Root,Model=NoName,Vector=Compartments[default_compartment],Vector=Metabolites[B],Reference=Concentration"/>
                <Parameter type="unsignedInteger" name="Role" value="2"/>
              </ParameterGroup>
              <ParameterGroup name="3">
                <Parameter type="cn" name="Object CN" value="CN=Root,Model=NoName,Vector=Compartments[default_compartment],Vector=Metabolites[P],Reference=Concentration"/>
                <Parameter type="unsignedInteger" name="Role" value="2"/>
              </ParameterGroup>
              <ParameterGroup name="4">
                <Parameter type="cn" name="Object CN" value="CN=Root,Model=NoName,Vector=Compartments[default_compartment],Vector=Metabolites[cat],Reference=Concentration"/>
                <Parameter type="unsignedInteger" name="Role" value="2"/>
              </ParameterGroup>
              <ParameterGroup name="5">
                <Parameter type="cn" name="Object CN" value="CN=Root,Model=NoName,Vector=Compartments[default_compartment],Vector=Metabolites[A],Reference=InitialConcentration"/>
                <Parameter type="unsignedInteger" name="Role" value="1"/>
              </ParameterGroup>
              <ParameterGroup name="6">
                <Parameter type="cn" name="Object CN" value="CN=Root,Model=NoName,Vector=Compartments[default_compartment],Vector=Metabolites[B],Reference=InitialConcentration"/>
                <Parameter type="unsignedInteger" name="Role" value="1"/>
              </ParameterGroup>
              <ParameterGroup name="7">
                <Parameter type="cn" name="Object CN" value="CN=Root,Model=NoName,Vector=Compartments[default_compartment],Vector=Metabolites[P],Reference=InitialConcentration"/>
                <Parameter type="unsignedInteger" name="Role" value="1"/>
              </ParameterGroup>
              <ParameterGroup name="8">
                <Parameter type="cn" name="Object CN" value="CN=Root,Model=NoName,Vector=Compartments[default_compartment],Vector=Metabolites[cat],Reference=InitialConcentration"/>
                <Parameter type="unsignedInteger" name="Role" value="1"/>
              </ParameterGroup>
            </ParameterGroup>
          </ParameterGroup>
          <ParameterGroup name="exp1_data_">
            <Parameter type="key" name="Key" value="Experiment_exp1_data_"/>
            <Parameter type="file" name="File Name" value="copasi_input/exp1_data_.csv"/>
            <Parameter type="bool" name="Data is Row Oriented" value="1"/>
            <Parameter type="unsignedInteger" name="First Row" value="1"/>
            <Parameter type="unsignedInteger" name="Last Row" value="62"/>
            <Parameter type="unsignedInteger" name="Experiment Type" value="1"/>
            <Parameter type="bool" name="Normalize Weights per Experiment" value="1"/>
            <Parameter type="string" name="Separator" value=","/>
            <Parameter type="unsignedInteger" name="Weight Method" value="1"/>
            <Parameter type="unsignedInteger" name="Row containing Names" value="1"/>
            <Parameter type="unsignedInteger" name="Number of Columns" value="11"/>
            <ParameterGroup name="Object Map">
              <ParameterGroup name="0">
                <Parameter type="unsignedInteger" name="Role" value="3"/>
              </ParameterGroup>
              <ParameterGroup name="1">
                <Parameter type="cn" name="Object CN" value="CN=Root,Model=NoName,Vector=Compartments[default_compartment],Vector=Metabolites[A],Reference=Concentration"/>
                <Parameter type="unsignedInteger" name="Role" value="2"/>
              </ParameterGroup>
              <ParameterGroup name="2">
                <Parameter type="cn" name="Object CN" value="CN=Root,Model=NoName,Vector=Compartments[default_compartment],Vector=Metabolites[B],Reference=Concentration"/>
                <Parameter type="unsignedInteger" name="Role" value="2"/>
              </ParameterGroup>
              <ParameterGroup name="3">
                <Parameter type="cn" name="Object CN" value="CN=Root,Model=NoName,Vector=Compartments[default_compartment],Vector=Metabolites[P],Reference=Concentration"/>
                <Parameter type="unsignedInteger" name="Role" value="2"/>
              </ParameterGroup>
              <ParameterGroup name="4">
                <Parameter type="cn" name="Object CN" value="CN=Root,Model=NoName,Vector=Compartments[default_compartment],Vector=Metabolites[cat],Reference=Concentration"/>
                <Parameter type="unsignedInteger" name="Role" value="2"/>
              </ParameterGroup>
              <ParameterGroup name="5">
                <Parameter type="cn" name="Object CN" value="CN=Root,Model=NoName,Vector=Values[event_1],Reference=Value"/>
                <Parameter type="unsignedInteger" name="Role" value="2"/>
              </ParameterGroup>
              <ParameterGroup name="6">
                <Parameter type="cn" name="Object CN" value="CN=Root,Model=NoName,Vector=Compartments[default_compartment],Vector=Metabolites[A],Reference=InitialConcentration"/>
                <Parameter type="unsignedInteger" name="Role" value="1"/>
              </ParameterGroup>
              <ParameterGroup name="7">
                <Parameter type="cn" name="Object CN" value="CN=Root,Model=NoName,Vector=Compartments[default_compartment],Vector=Metabolites[B],Reference=InitialConcentration"/>
                <Parameter type="unsignedInteger" name="Role" value="1"/>
              </ParameterGroup>
              <ParameterGroup name="8">
                <Parameter type="cn" name="Object CN" value="CN=Root,Model=NoName,Vector=Compartments[default_compartment],Vector=Metabolites[P],Reference=InitialConcentration"/>
                <Parameter type="unsignedInteger" name="Role" value="1"/>
              </ParameterGroup>
              <ParameterGroup name="9">
                <Parameter type="cn" name="Object CN" value="CN=Root,Model=NoName,Vector=Compartments[default_compartment],Vector=Metabolites[cat],Reference=InitialConcentration"/>
                <Parameter type="unsignedInteger" name="Role" value="1"/>
              </ParameterGroup>
              <ParameterGroup name="10">
                <Parameter type="cn" name="Object CN" value="CN=Root,Model=NoName,Vector=Values[event_1],Reference=InitialValue"/>
                <Parameter type="unsignedInteger" name="Role" value="1"/>
              </ParameterGroup>
            </ParameterGroup>
          </ParameterGroup>
        </ParameterGroup>
        <ParameterGroup name="Validation Set">
          <Parameter name="Weight" type="unsignedFloat" value="1"/>
          <Parameter name="Threshold" type="unsignedInteger" value="5"/>
        </ParameterGroup>
      </Problem>
      <Method name="Genetic Algorithm" type="GeneticAlgorithm">
        <Parameter type="unsignedInteger" name="Number of Generations" value="30"/>
        <Parameter type="unsignedInteger" name="Population Size" value="30"/>
        <Parameter type="unsignedInteger" name="Random Number Generator" value="1"/>
        <Parameter type="unsignedInteger" name="Seed" value="0"/>
      </Method>
    </Task>
    <Task key="Task_23" name="Metabolic Control Analysis" type="metabolicControlAnalysis" scheduled="false" updateModel="false">
      <Report reference="Report_16" target="" append="1" confirmOverwrite="1"/>
      <Problem>
        <Parameter name="Steady-State" type="key" value="Task_17"/>
      </Problem>
      <Method name="MCA Method (Reder)" type="MCAMethod(Reder)">
        <Parameter name="Modulation Factor" type="unsignedFloat" value="1.0000000000000001e-09"/>
        <Parameter name="Use Reder" type="bool" value="1"/>
        <Parameter name="Use Smallbone" type="bool" value="1"/>
      </Method>
    </Task>
    <Task key="Task_24" name="Lyapunov Exponents" type="lyapunovExponents" scheduled="false" updateModel="false">
      <Report reference="Report_17" target="" append="1" confirmOverwrite="1"/>
      <Problem>
        <Parameter name="ExponentNumber" type="unsignedInteger" value="3"/>
        <Parameter name="DivergenceRequested" type="bool" value="1"/>
        <Parameter name="TransientTime" type="float" value="0"/>
      </Problem>
      <Method name="Wolf Method" type="WolfMethod">
        <Parameter name="Orthonormalization Interval" type="unsignedFloat" value="1"/>
        <Parameter name="Overall time" type="unsignedFloat" value="1000"/>
        <Parameter name="Relative Tolerance" type="unsignedFloat" value="9.9999999999999995e-07"/>
        <Parameter name="Absolute Tolerance" type="unsignedFloat" value="9.9999999999999998e-13"/>
        <Parameter name="Max Internal Steps" type="unsignedInteger" value="10000"/>
      </Method>
    </Task>
    <Task key="Task_25" name="Time Scale Separation Analysis" type="timeScaleSeparationAnalysis" scheduled="false" updateModel="false">
      <Report reference="Report_18" target="" append="1" confirmOverwrite="1"/>
      <Problem>
        <Parameter name="StepNumber" type="unsignedInteger" value="100"/>
        <Parameter name="StepSize" type="float" value="0.01"/>
        <Parameter name="Duration" type="float" value="1"/>
        <Parameter name="TimeSeriesRequested" type="bool" value="1"/>
        <Parameter name="OutputStartTime" type="float" value="0"/>
      </Problem>
      <Method name="ILDM (LSODA,Deuflhard)" type="TimeScaleSeparation(ILDM,Deuflhard)">
        <Parameter name="Deuflhard Tolerance" type="unsignedFloat" value="0.0001"/>
      </Method>
    </Task>
    <Task key="Task_26" name="Sensitivities" type="sensitivities" scheduled="false" updateModel="false">
      <Report reference="Report_19" target="" append="1" confirmOverwrite="1"/>
      <Problem>
        <Parameter name="SubtaskType" type="unsignedInteger" value="1"/>
        <ParameterGroup name="TargetFunctions">
          <Parameter name="SingleObject" type="cn" value=""/>
          <Parameter name="ObjectListType" type="unsignedInteger" value="7"/>
        </ParameterGroup>
        <ParameterGroup name="ListOfVariables">
          <ParameterGroup name="Variables">
            <Parameter name="SingleObject" type="cn" value=""/>
            <Parameter name="ObjectListType" type="unsignedInteger" value="41"/>
          </ParameterGroup>
          <ParameterGroup name="Variables">
            <Parameter name="SingleObject" type="cn" value=""/>
            <Parameter name="ObjectListType" type="unsignedInteger" value="0"/>
          </ParameterGroup>
        </ParameterGroup>
      </Problem>
      <Method name="Sensitivities Method" type="SensitivitiesMethod">
        <Parameter name="Delta factor" type="unsignedFloat" value="0.001"/>
        <Parameter name="Delta minimum" type="unsignedFloat" value="9.9999999999999998e-13"/>
      </Method>
    </Task>
    <Task key="Task_27" name="Moieties" type="moieties" scheduled="false" updateModel="false">
      <Report reference="Report_20" target="" append="1" confirmOverwrite="1"/>
      <Problem>
      </Problem>
      <Method name="Householder Reduction" type="Householder">
      </Method>
    </Task>
    <Task key="Task_28" name="Cross Section" type="crosssection" scheduled="false" updateModel="false">
      <Problem>
        <Parameter name="AutomaticStepSize" type="bool" value="0"/>
        <Parameter name="StepNumber" type="unsignedInteger" value="100"/>
        <Parameter name="StepSize" type="float" value="0.01"/>
        <Parameter name="Duration" type="float" value="1"/>
        <Parameter name="TimeSeriesRequested" type="bool" value="1"/>
        <Parameter name="OutputStartTime" type="float" value="0"/>
        <Parameter name="Output Event" type="bool" value="0"/>
        <Parameter name="Start in Steady State" type="bool" value="0"/>
        <Parameter name="Use Values" type="bool" value="0"/>
        <Parameter name="Values" type="string" value=""/>
        <Parameter name="LimitCrossings" type="bool" value="0"/>
        <Parameter name="NumCrossingsLimit" type="unsignedInteger" value="0"/>
        <Parameter name="LimitOutTime" type="bool" value="0"/>
        <Parameter name="LimitOutCrossings" type="bool" value="0"/>
        <Parameter name="PositiveDirection" type="bool" value="1"/>
        <Parameter name="NumOutCrossingsLimit" type="unsignedInteger" value="0"/>
        <Parameter name="LimitUntilConvergence" type="bool" value="0"/>
        <Parameter name="ConvergenceTolerance" type="float" value="9.9999999999999995e-07"/>
        <Parameter name="Threshold" type="float" value="0"/>
        <Parameter name="DelayOutputUntilConvergence" type="bool" value="0"/>
        <Parameter name="OutputConvergenceTolerance" type="float" value="9.9999999999999995e-07"/>
        <ParameterText name="TriggerExpression" type="expression">
          
        </ParameterText>
        <Parameter name="SingleVariable" type="cn" value=""/>
      </Problem>
      <Method name="Deterministic (LSODA)" type="Deterministic(LSODA)">
        <Parameter name="Integrate Reduced Model" type="bool" value="0"/>
        <Parameter name="Relative Tolerance" type="unsignedFloat" value="9.9999999999999995e-07"/>
        <Parameter name="Absolute Tolerance" type="unsignedFloat" value="9.9999999999999998e-13"/>
        <Parameter name="Max Internal Steps" type="unsignedInteger" value="100000"/>
        <Parameter name="Max Internal Step Size" type="unsignedFloat" value="0"/>
      </Method>
    </Task>
    <Task key="Task_29" name="Linear Noise Approximation" type="linearNoiseApproximation" scheduled="false" updateModel="false">
      <Report reference="Report_21" target="" append="1" confirmOverwrite="1"/>
      <Problem>
        <Parameter name="Steady-State" type="key" value="Task_17"/>
      </Problem>
      <Method name="Linear Noise Approximation" type="LinearNoiseApproximation">
      </Method>
    </Task>
    <Task key="Task_30" name="Time-Course Sensitivities" type="timeSensitivities" scheduled="false" updateModel="false">
      <Problem>
        <Parameter name="AutomaticStepSize" type="bool" value="0"/>
        <Parameter name="StepNumber" type="unsignedInteger" value="100"/>
        <Parameter name="StepSize" type="float" value="0.01"/>
        <Parameter name="Duration" type="float" value="1"/>
        <Parameter name="TimeSeriesRequested" type="bool" value="1"/>
        <Parameter name="OutputStartTime" type="float" value="0"/>
        <Parameter name="Output Event" type="bool" value="0"/>
        <Parameter name="Start in Steady State" type="bool" value="0"/>
        <Parameter name="Use Values" type="bool" value="0"/>
        <Parameter name="Values" type="string" value=""/>
        <ParameterGroup name="ListOfParameters">
        </ParameterGroup>
        <ParameterGroup name="ListOfTargets">
        </ParameterGroup>
      </Problem>
      <Method name="LSODA Sensitivities" type="Sensitivities(LSODA)">
        <Parameter name="Integrate Reduced Model" type="bool" value="0"/>
        <Parameter name="Relative Tolerance" type="unsignedFloat" value="9.9999999999999995e-07"/>
        <Parameter name="Absolute Tolerance" type="unsignedFloat" value="9.9999999999999998e-13"/>
        <Parameter name="Max Internal Steps" type="unsignedInteger" value="10000"/>
        <Parameter name="Max Internal Step Size" type="unsignedFloat" value="0"/>
      </Method>
    </Task>
  </ListOfTasks>
  <ListOfReports>
    <Report key="Report_11" name="Steady-State" taskType="steadyState" separator="&#9;" precision="6">
      <Comment>
        Automatically generated report.
      </Comment>
      <Footer>
        <Object cn="CN=Root,Vector=TaskList[Steady-State]"/>
      </Footer>
    </Report>
    <Report key="Report_12" name="Time-Course" taskType="timeCourse" separator="&#9;" precision="6">
      <Comment>
        Automatically generated report.
      </Comment>
      <Header>
        <Object cn="CN=Root,Vector=TaskList[Time-Course],Object=Description"/>
      </Header>
      <Footer>
        <Object cn="CN=Root,Vector=TaskList[Time-Course],Object=Result"/>
      </Footer>
    </Report>
    <Report key="Report_13" name="Elementary Flux Modes" taskType="fluxMode" separator="&#9;" precision="6">
      <Comment>
        Automatically generated report.
      </Comment>
      <Footer>
        <Object cn="CN=Root,Vector=TaskList[Elementary Flux Modes],Object=Result"/>
      </Footer>
    </Report>
    <Report key="Report_14" name="Optimization" taskType="optimization" separator="&#9;" precision="6">
      <Comment>
        Automatically generated report.
      </Comment>
      <Header>
        <Object cn="CN=Root,Vector=TaskList[Optimization],Object=Description"/>
        <Object cn="String=\[Function Evaluations\]"/>
        <Object cn="Separator=&#9;"/>
        <Object cn="String=\[Best Value\]"/>
        <Object cn="Separator=&#9;"/>
        <Object cn="String=\[Best Parameters\]"/>
      </Header>
      <Body>
        <Object cn="CN=Root,Vector=TaskList[Optimization],Problem=Optimization,Reference=Function Evaluations"/>
        <Object cn="Separator=&#9;"/>
        <Object cn="CN=Root,Vector=TaskList[Optimization],Problem=Optimization,Reference=Best Value"/>
        <Object cn="Separator=&#9;"/>
        <Object cn="CN=Root,Vector=TaskList[Optimization],Problem=Optimization,Reference=Best Parameters"/>
      </Body>
      <Footer>
        <Object cn="String=&#10;"/>
        <Object cn="CN=Root,Vector=TaskList[Optimization],Object=Result"/>
      </Footer>
    </Report>
    <Report key="Report_15" name="Parameter Estimation" taskType="parameterFitting" separator="&#9;" precision="6">
      <Comment>
        Automatically generated report.
      </Comment>
      <Header>
        <Object cn="CN=Root,Vector=TaskList[Parameter Estimation],Object=Description"/>
        <Object cn="String=\[Function Evaluations\]"/>
        <Object cn="Separator=&#9;"/>
        <Object cn="String=\[Best Value\]"/>
        <Object cn="Separator=&#9;"/>
        <Object cn="String=\[Best Parameters\]"/>
      </Header>
      <Body>
        <Object cn="CN=Root,Vector=TaskList[Parameter Estimation],Problem=Parameter Estimation,Reference=Function Evaluations"/>
        <Object cn="Separator=&#9;"/>
        <Object cn="CN=Root,Vector=TaskList[Parameter Estimation],Problem=Parameter Estimation,Reference=Best Value"/>
        <Object cn="Separator=&#9;"/>
        <Object cn="CN=Root,Vector=TaskList[Parameter Estimation],Problem=Parameter Estimation,Reference=Best Parameters"/>
      </Body>
      <Footer>
        <Object cn="String=&#10;"/>
        <Object cn="CN=Root,Vector=TaskList[Parameter Estimation],Object=Result"/>
      </Footer>
    </Report>
    <Report key="Report_16" name="Metabolic Control Analysis" taskType="metabolicControlAnalysis" separator="&#9;" precision="6">
      <Comment>
        Automatically generated report.
      </Comment>
      <Header>
        <Object cn="CN=Root,Vector=TaskList[Metabolic Control Analysis],Object=Description"/>
      </Header>
      <Footer>
        <Object cn="String=&#10;"/>
        <Object cn="CN=Root,Vector=TaskList[Metabolic Control Analysis],Object=Result"/>
      </Footer>
    </Report>
    <Report key="Report_17" name="Lyapunov Exponents" taskType="lyapunovExponents" separator="&#9;" precision="6">
      <Comment>
        Automatically generated report.
      </Comment>
      <Header>
        <Object cn="CN=Root,Vector=TaskList[Lyapunov Exponents],Object=Description"/>
      </Header>
      <Footer>
        <Object cn="String=&#10;"/>
        <Object cn="CN=Root,Vector=TaskList[Lyapunov Exponents],Object=Result"/>
      </Footer>
    </Report>
    <Report key="Report_18" name="Time Scale Separation Analysis" taskType="timeScaleSeparationAnalysis" separator="&#9;" precision="6">
      <Comment>
        Automatically generated report.
      </Comment>
      <Header>
        <Object cn="CN=Root,Vector=TaskList[Time Scale Separation Analysis],Object=Description"/>
      </Header>
      <Footer>
        <Object cn="String=&#10;"/>
        <Object cn="CN=Root,Vector=TaskList[Time Scale Separation Analysis],Object=Result"/>
      </Footer>
    </Report>
    <Report key="Report_19" name="Sensitivities" taskType="sensitivities" separator="&#9;" precision="6">
      <Comment>
        Automatically generated report.
      </Comment>
      <Header>
        <Object cn="CN=Root,Vector=TaskList[Sensitivities],Object=Description"/>
      </Header>
      <Footer>
        <Object cn="String=&#10;"/>
        <Object cn="CN=Root,Vector=TaskList[Sensitivities],Object=Result"/>
      </Footer>
    </Report>
    <Report key="Report_20" name="Moieties" taskType="moieties" separator="&#9;" precision="6">
      <Comment>
        Automatically generated report.
      </Comment>
      <Header>
        <Object cn="CN=Root,Vector=TaskList[Moieties],Object=Description"/>
      </Header>
      <Footer>
        <Object cn="String=&#10;"/>
        <Object cn="CN=Root,Vector=TaskList[Moieties],Object=Result"/>
      </Footer>
    </Report>
    <Report key="Report_21" name="Linear Noise Approximation" taskType="linearNoiseApproximation" separator="&#9;" precision="6">
      <Comment>
        Automatically generated report.
      </Comment>
      <Header>
        <Object cn="CN=Root,Vector=TaskList[Linear Noise Approximation],Object=Description"/>
      </Header>
      <Footer>
        <Object cn="String=&#10;"/>
        <Object cn="CN=Root,Vector=TaskList[Linear Noise Approximation],Object=Result"/>
      </Footer>
    </Report>
    <Report precision="6" separator="&#9;" name="multi_parameter_estimation" key="Report_96" taskType="parameterFitting">
      <Comment/>
      <Table printTitle="1">
        <Object cn="CN=Root,Vector=TaskList[Parameter Estimation],Problem=Parameter Estimation,Reference=Best Parameters"/>
        <Object cn="CN=Root,Vector=TaskList[Parameter Estimation],Problem=Parameter Estimation,Reference=Best Value"/>
      </Table>
    </Report>
  </ListOfReports>
  <GUI>
  </GUI>
  <SBMLReference file="my_copasi.sbml">
    <SBMLMap SBMLid="A" COPASIkey="Metabolite_0"/>
    <SBMLMap SBMLid="A_added_mmol_1" COPASIkey="ModelValue_13"/>
    <SBMLMap SBMLid="A_added_mmol_2" COPASIkey="ModelValue_19"/>
    <SBMLMap SBMLid="B" COPASIkey="Metabolite_3"/>
    <SBMLMap SBMLid="J1" COPASIkey="Reaction_0"/>
    <SBMLMap SBMLid="J2" COPASIkey="Reaction_1"/>
    <SBMLMap SBMLid="J3" COPASIkey="Reaction_2"/>
    <SBMLMap SBMLid="J4" COPASIkey="Reaction_3"/>
    <SBMLMap SBMLid="P" COPASIkey="Metabolite_5"/>
    <SBMLMap SBMLid="_E0" COPASIkey="Event_0"/>
    <SBMLMap SBMLid="_E1" COPASIkey="Event_1"/>
    <SBMLMap SBMLid="add_vol1" COPASIkey="ModelValue_10"/>
    <SBMLMap SBMLid="add_vol2" COPASIkey="ModelValue_15"/>
    <SBMLMap SBMLid="cat" COPASIkey="Metabolite_1"/>
    <SBMLMap SBMLid="cat1" COPASIkey="Metabolite_2"/>
    <SBMLMap SBMLid="cat2" COPASIkey="Metabolite_4"/>
    <SBMLMap SBMLid="catI" COPASIkey="Metabolite_6"/>
    <SBMLMap SBMLid="cat_added_mmol_2" COPASIkey="ModelValue_18"/>
    <SBMLMap SBMLid="default_compartment" COPASIkey="Compartment_0"/>
    <SBMLMap SBMLid="event_1" COPASIkey="ModelValue_8"/>
    <SBMLMap SBMLid="k1" COPASIkey="ModelValue_0"/>
    <SBMLMap SBMLid="k2" COPASIkey="ModelValue_2"/>
    <SBMLMap SBMLid="k3" COPASIkey="ModelValue_4"/>
    <SBMLMap SBMLid="k4" COPASIkey="ModelValue_6"/>
    <SBMLMap SBMLid="kN1" COPASIkey="ModelValue_1"/>
    <SBMLMap SBMLid="kN2" COPASIkey="ModelValue_3"/>
    <SBMLMap SBMLid="kN3" COPASIkey="ModelValue_5"/>
    <SBMLMap SBMLid="kN4" COPASIkey="ModelValue_7"/>
    <SBMLMap SBMLid="new_vol1" COPASIkey="ModelValue_11"/>
    <SBMLMap SBMLid="new_vol2" COPASIkey="ModelValue_16"/>
    <SBMLMap SBMLid="ratio1" COPASIkey="ModelValue_12"/>
    <SBMLMap SBMLid="ratio2" COPASIkey="ModelValue_17"/>
    <SBMLMap SBMLid="rct_vol1" COPASIkey="ModelValue_9"/>
    <SBMLMap SBMLid="rct_vol2" COPASIkey="ModelValue_14"/>
  </SBMLReference>
  <ListOfUnitDefinitions>
    <UnitDefinition key="Unit_1" name="meter" symbol="m">
      <MiriamAnnotation>
        <rdf:RDF xmlns:dcterms="http://purl.org/dc/terms/" xmlns:rdf="http://www.w3.org/1999/02/22-rdf-syntax-ns#">
          <rdf:Description rdf:about="#Unit_0">
</rdf:Description>
        </rdf:RDF>
      </MiriamAnnotation>
      <Expression>
        m
      </Expression>
    </UnitDefinition>
    <UnitDefinition key="Unit_5" name="second" symbol="s">
      <MiriamAnnotation>
        <rdf:RDF xmlns:dcterms="http://purl.org/dc/terms/" xmlns:rdf="http://www.w3.org/1999/02/22-rdf-syntax-ns#">
          <rdf:Description rdf:about="#Unit_4">
</rdf:Description>
        </rdf:RDF>
      </MiriamAnnotation>
      <Expression>
        s
      </Expression>
    </UnitDefinition>
    <UnitDefinition key="Unit_13" name="Avogadro" symbol="Avogadro">
      <MiriamAnnotation>
        <rdf:RDF xmlns:dcterms="http://purl.org/dc/terms/" xmlns:rdf="http://www.w3.org/1999/02/22-rdf-syntax-ns#">
          <rdf:Description rdf:about="#Unit_12">
</rdf:Description>
        </rdf:RDF>
      </MiriamAnnotation>
      <Expression>
        Avogadro
      </Expression>
    </UnitDefinition>
    <UnitDefinition key="Unit_17" name="item" symbol="#">
      <MiriamAnnotation>
        <rdf:RDF xmlns:dcterms="http://purl.org/dc/terms/" xmlns:rdf="http://www.w3.org/1999/02/22-rdf-syntax-ns#">
          <rdf:Description rdf:about="#Unit_16">
</rdf:Description>
        </rdf:RDF>
      </MiriamAnnotation>
      <Expression>
        #
      </Expression>
    </UnitDefinition>
    <UnitDefinition key="Unit_35" name="liter" symbol="l">
      <MiriamAnnotation>
        <rdf:RDF xmlns:dcterms="http://purl.org/dc/terms/" xmlns:rdf="http://www.w3.org/1999/02/22-rdf-syntax-ns#">
          <rdf:Description rdf:about="#Unit_34">
</rdf:Description>
        </rdf:RDF>
      </MiriamAnnotation>
      <Expression>
        0.001*m^3
      </Expression>
    </UnitDefinition>
    <UnitDefinition key="Unit_41" name="mole" symbol="mol">
      <MiriamAnnotation>
        <rdf:RDF xmlns:dcterms="http://purl.org/dc/terms/" xmlns:rdf="http://www.w3.org/1999/02/22-rdf-syntax-ns#">
          <rdf:Description rdf:about="#Unit_40">
</rdf:Description>
        </rdf:RDF>
      </MiriamAnnotation>
      <Expression>
        Avogadro*#
      </Expression>
    </UnitDefinition>
  </ListOfUnitDefinitions>
</COPASI>
